import { Alert } from 'react-native';
import {
  addMember,
  createGroup as createGroupUC,
  joinGroup as joinGroupUC,
  leaveGroup as leaveGroupUC,
  processRequest as processRequestUC,
  removeMember as removeMemberUC,
  transferAdmin as transferAdminUC,
} from '../../di/container';
import { useAuthStore } from '../store/useAuthStore';
import { handleApiError } from '../utils/errorHandler';

export const useGroupActions = () => {
  const user = useAuthStore((state) => state.user);

  const createGroup = async (name: string, subjectId: string, description: string) => {
    if (!user?.uid) return null;
    try {
      return await createGroupUC.execute(name, subjectId, description, user.uid);
    } catch (e: any) {
      handleApiError(e, 'No se pudo crear el grupo.');
      return null;
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user?.uid) return false;
    try {
      await joinGroupUC.execute(groupId, user.uid, user.name);
      Alert.alert('¡Éxito!', 'Solicitud enviada correctamente. Espera a que un administrador la apruebe.');
      return true;
    } catch (e: any) {
      handleApiError(e, 'No se pudo enviar la solicitud.');
      return false;
    }
  };

  const processRequest = async (groupId: string, requestId: string, status: 'accepted' | 'rejected') => {
    try {
      const success = await processRequestUC.execute(groupId, requestId, status);
      if (success) {
        Alert.alert('Éxito', `Solicitud ${status === 'accepted' ? 'aceptada' : 'rechazada'}`);
        return true;
      }
    } catch (e: any) {
      handleApiError(e, 'No se pudo procesar la solicitud.');
    }
    return false;
  };

  const transferAdmin = async (groupId: string, newAdminId: string) => {
    if (!user?.uid) return false;
    try {
      await transferAdminUC.execute(groupId, user.uid, newAdminId);
      Alert.alert('¡Éxito!', 'Has cedido la administración de este grupo.');
      return true;
    } catch (e: any) {
      handleApiError(e, 'No se pudo transferir la administración.');
      return false;
    }
  };

  const removeMember = async (groupId: string, memberId: string) => {
    if (!user?.uid) return false;
    try {
      await removeMemberUC.execute(groupId, memberId, user.uid);
      Alert.alert('Éxito', 'Miembro eliminado.');
      return true;
    } catch (e: any) {
      handleApiError(e, 'No se pudo eliminar al miembro.');
      return false;
    }
  };

  const addMemberToGroup = async (groupId: string, userId: string) => {
    try {
      const success = await addMember.execute(groupId, userId);
      return success;
    } catch (e: any) {
      handleApiError(e, 'Error al añadir miembro.');
      return false;
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user?.uid) return false;
    try {
      const success = await leaveGroupUC.execute(groupId, user.uid);
      if (success) {
        try {
          const { ApiGroupRepository } = await import('../../data/repositories/ApiGroupRepository');
          const repo = new ApiGroupRepository();
          await repo.deleteUserRequests(groupId, user.uid);
        } catch (cleanError) {
          console.warn("No se pudieron limpiar las solicitudes, pero el usuario salió.");
        }
        return true;
      }
      return false;
    } catch (e: any) {
      handleApiError(e, 'No se pudo salir del grupo.');
      return false;
    }
  };

  return {
    createGroup,
    joinGroup,
    processRequest,
    transferAdmin,
    removeMember,
    addMemberToGroup,
    leaveGroup,
  };
};