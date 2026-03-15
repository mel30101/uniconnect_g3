import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import {
  getGroupDetail as getGroupDetailUC,
  joinGroup as joinGroupUC,
  processRequest as processRequestUC,
  transferAdmin as transferAdminUC,
  removeMember as removeMemberUC,
  addMember,
  leaveGroup as leaveGroupUC,
} from '../../di/container';
import { ApiGroupRepository } from '../../data/repositories/ApiGroupRepository';

const groupRepo = new ApiGroupRepository();

export const useGroupDetail = (groupId: string) => {
  const user = useAuthStore((state) => state.user);
  const [group, setGroup] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = useCallback(async () => {
    if (!groupId) return;
    setLoading(true);
    try {
      const data = await getGroupDetailUC.execute(groupId);
      setGroup(data);
    } catch (e) {
      console.error('Error fetching group detail:', e);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  const fetchRequests = useCallback(async () => {
    if (!groupId) return;
    try {
      const data = await groupRepo.getRequests(groupId);
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  }, [groupId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const joinGroup = async () => {
    if (!user) return false;
    try {
      await joinGroupUC.execute(groupId, user.uid, user.name);
      Alert.alert('¡Éxito!', 'Solicitud enviada.');
      return true;
    } catch (e: any) {
      Alert.alert('Aviso', e.response?.data?.error || e.message);
      return false;
    }
  };

  const processRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const success = await processRequestUC.execute(groupId, requestId, status);
      if (success) {
        Alert.alert('Éxito', `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
        fetchRequests();
        fetchDetail();
        return true;
      }
    } catch {
      Alert.alert('Error', 'No se pudo procesar');
    }
    return false;
  };

  const transferAdminHandler = async (newAdminId: string) => {
    if (!user?.uid) return false;
    try {
      await transferAdminUC.execute(groupId, user.uid, newAdminId);
      Alert.alert('¡Éxito!', 'Has cedido la administración de este grupo.');
      return true;
    } catch (e: any) {
      Alert.alert('Aviso', e.response?.data?.error || e.message);
      return false;
    }
  };

  const removeMemberHandler = async (memberId: string) => {
    if (!user?.uid) return false;
    try {
      await removeMemberUC.execute(groupId, memberId, user.uid);
      Alert.alert('Éxito', 'Miembro eliminado.');
      fetchDetail();
      return true;
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'No se pudo eliminar al miembro.');
      return false;
    }
  };

  const addMemberToGroup = async (userId: string) => {
    try {
      const success = await addMember.execute(groupId, userId);
      if (success) fetchDetail();
      return success;
    } catch (e) {
      console.error('Error al añadir miembro:', e);
      return false;
    }
  };

  const leaveGroupHandler = async () => {
    if (!user?.uid) return false;
    try {
      const success = await leaveGroupUC.execute(groupId, user.uid);
      if (success) {
        Alert.alert('Éxito', 'Has salido del grupo.');
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const isAdmin = group?.members?.some((m: any) => m.id === user?.uid && m.role === 'admin');
  const isMember = group?.members?.some((m: any) => m.id === user?.uid);

  return {
    group,
    setGroup,
    requests,
    loading,
    isAdmin,
    isMember,
    user,
    fetchDetail,
    fetchRequests,
    joinGroup,
    processRequest,
    transferAdmin: transferAdminHandler,
    removeMember: removeMemberHandler,
    addMemberToGroup,
    leaveGroup: leaveGroupHandler,
  };
};
