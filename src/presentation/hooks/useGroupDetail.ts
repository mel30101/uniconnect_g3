import { useCallback, useEffect, useState } from 'react';
import { ApiGroupRepository } from '../../data/repositories/ApiGroupRepository';
import { getGroupDetail as getGroupDetailUC } from '../../di/container';
import { useAuthStore } from '../store/useAuthStore';
import { useGroupActions } from './useGroupActions'; 

const groupRepo = new ApiGroupRepository();

export const useGroupDetail = (groupId: string) => {
  const user = useAuthStore((state) => state.user);
  
  const { joinGroup, processRequest, transferAdmin, removeMember, addMemberToGroup, leaveGroup } = useGroupActions();

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

  const handleJoin = async () => await joinGroup(groupId);

  const handleProcessRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    const success = await processRequest(groupId, requestId, status);
    if (success) {
      fetchRequests();
      fetchDetail();
    }
    return success;
  };

  const handleTransferAdmin = async (newAdminId: string) => await transferAdmin(groupId, newAdminId);

  const handleRemoveMember = async (memberId: string) => {
    const success = await removeMember(groupId, memberId);
    if (success) fetchDetail();
    return success;
  };

  const handleAddMember = async (userId: string) => {
    const success = await addMemberToGroup(groupId, userId);
    if (success) fetchDetail();
    return success;
  };

  const handleLeaveGroup = async () => await leaveGroup(groupId);

  const isAdmin = group?.members?.some((m: any) => m.id === user?.uid && m.role === 'admin');
  const isMember = group?.members?.some((m: any) => m.id === user?.uid);

  return {
    group,
    requests,
    loading,
    isAdmin,
    isMember,
    user,
    fetchDetail,
    fetchRequests,
    joinGroup: handleJoin,
    processRequest: handleProcessRequest,
    transferAdmin: handleTransferAdmin,
    removeMember: handleRemoveMember,
    addMemberToGroup: handleAddMember,
    leaveGroup: handleLeaveGroup,
  };
};