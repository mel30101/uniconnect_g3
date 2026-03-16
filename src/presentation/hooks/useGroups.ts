import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { addMember, createGroup as createGroupUC, getCareerStructure, getGroupDetail as getGroupDetailUC, getUserGroups, joinGroup as joinGroupUC, leaveGroup as leaveGroupUC, processRequest as processRequestUC, removeMember as removeMemberUC, transferAdmin as transferAdminUC, } from '../../di/container';
import { Subject } from '../../domain/entities/Subject';
import { useAuthStore } from '../store/useAuthStore';
import { handleApiError } from '../utils/errorHandler';

export const useGroups = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [userSubjects, setUserSubjects] = useState<Subject[]>([]);
  const [managedGroups, setManagedGroups] = useState<any[]>([]);
  const [memberGroups, setMemberGroups] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const fetchManagedGroups = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getUserGroups.execute(user.uid, 'admin');
      setManagedGroups(data);
    } catch (e) {
      console.error('Error fetching managed groups:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);
  const fetchMemberGroups = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await getUserGroups.execute(user.uid, 'student');
      setMemberGroups(data);
    } catch (e) {
      console.error('Error fetching member groups:', e);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);
  const fetchGroupDetail = useCallback(async (groupId: string) => {
    setLoading(true);
    try {
      return await getGroupDetailUC.execute(groupId);
    } catch (e) {
      console.error('Error fetching group detail:', e);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);
  const fetchUserSubjects = useCallback(async () => {
    if (!user?.uid || !user?.careerId) return;
    try {
      const sectionsData = await getCareerStructure.execute(user.careerId);
      const profileSubjects = user.subjects || [];
      const allSubjects: Subject[] = [];
      sectionsData.forEach((section: any) => {
        section.subjects.forEach((sub: any) => {
          if (profileSubjects.includes(sub.id)) {
            allSubjects.push({ id: sub.id, name: sub.name });
          }
        });
      });
      setUserSubjects(allSubjects);
    } catch (e) {
      console.error('Error fetching subjects for groups:', e);
    }
  }, [user?.uid, user?.careerId, user?.subjects]);
  useEffect(() => { fetchUserSubjects(); }, [fetchUserSubjects]);
  const createGroup = async (name: string, subjectId: string, description: string) => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await createGroupUC.execute(name, subjectId, description, user.uid);
      return data;
    } catch (e: any) {
      handleApiError(e, 'No se pudo crear el grupo.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  const fetchRequests = useCallback(async (groupId: string) => {
    try {
      const { ApiGroupRepository } = await import('../../data/repositories/ApiGroupRepository');
      const repo = new ApiGroupRepository();
      const data = await repo.getRequests(groupId);
      setRequests(data);
    } catch (e) {
      console.error(e);
    }
  }, []);
  const joinGroupHandler = async (groupId: string) => {
    if (!user) return false;

    try {
      await joinGroupUC.execute(groupId, user.uid, user.name);
      return true;
    } catch (e: any) {
      handleApiError(e);
      return false;
    }
  };
  const processRequestHandler = async (groupId: string, requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const success = await processRequestUC.execute(groupId, requestId, status);
      if (success) {
        Alert.alert('Éxito', `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
        fetchRequests(groupId);
        return true;
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo procesar');
    }
    return false;
  };
  const transferAdminHandler = async (groupId: string, newAdminId: string) => {
    if (!user?.uid) return false;
    try {
      await transferAdminUC.execute(groupId, user.uid, newAdminId);
      Alert.alert('¡Éxito!', 'Has cedido la administración de este grupo. Ahora volverás a tu lista de grupos.');
      return true;
    } catch (e: any) {
      Alert.alert('Aviso', e.response?.data?.error || e.message);
      return false;
    }
  };
  const removeMemberHandler = async (groupId: string, userId: string) => {
    if (!user?.uid) return false;
    try {
      await removeMemberUC.execute(groupId, userId, user.uid);
      Alert.alert('Éxito', 'Miembro eliminado.');
      return true;
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.error || 'No se pudo eliminar al miembro.');
      return false;
    }
  };
  const addMemberToGroup = async (groupId: string, userId: string) => {
    try {
      return await addMember.execute(groupId, userId);
    } catch (e) {
      console.error('Error al añadir miembro:', e);
      return false;
    }
  };
  const leaveGroupHandler = async (groupId: string, userId: string) => {
    try {
      const success = await leaveGroupUC.execute(groupId, userId);
      if (success) {
        try {
          const { ApiGroupRepository } = await import('../../data/repositories/ApiGroupRepository');
          const repo = new ApiGroupRepository();
          await repo.deleteUserRequests(groupId, userId);
        } catch (cleanError) {
          console.warn("No se pudieron limpiar las solicitudes, pero el usuario salió.");
        }
        Alert.alert('Éxito', 'Has salido del grupo. Ahora puedes volver a solicitar unirte si lo deseas.');
        return true;
      }
      return false;
    } catch (e: any) {
      console.error(e);
      const errorMsg = e.response?.data?.message || "No se pudo salir del grupo.";
      Alert.alert('Error', String(errorMsg));
      return false;
    }
  };
  return {
    createGroup,
    userSubjects,
    managedGroups,
    memberGroups,
    fetchManagedGroups,
    fetchMemberGroups,
    fetchGroupDetail,
    fetchRequests,
    requests,
    loading,
    joinGroup: joinGroupHandler,
    processRequest: processRequestHandler,
    transferAdmin: transferAdminHandler,
    removeMember: removeMemberHandler,
    addMemberToGroup,
    leaveGroup: leaveGroupHandler,
  };
};