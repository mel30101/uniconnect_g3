import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationContext } from '../context/NotificationContext';
import { useSocket } from './useSocket';

// Mapeo de eventos crudos del Backend (Auditables)
const EVENT_MAP: Record<string, string> = {
  'SOLICITUD_INGRESO': 'SOLICITUD_INGRESO',
  'TRANSFERENCIA_ADMIN_SOLICITADA': 'TRANSFERENCIA_ADMIN_SOLICITADA',
  'MIEMBRO_ACEPTADO': 'MIEMBRO_ACEPTADO',
  'MIEMBRO_RECHAZADO': 'MIEMBRO_RECHAZADO',
  'TRANSFERENCIA_ADMIN': 'TRANSFERENCIA_ADMIN',
  'TRANSFERENCIA_ADMIN_ACEPTADA': 'TRANSFERENCIA_ADMIN_ACEPTADA',
  'TRANSFERENCIA_ADMIN_RECHAZADA': 'TRANSFERENCIA_ADMIN_RECHAZADA',
};

// Tipos amigables para el Frontend (UI)
const FRIENDLY_TYPES: Record<string, string> = {
  'SOLICITUD_INGRESO': 'join_request',
  'TRANSFERENCIA_ADMIN_SOLICITADA': 'admin_transfer',
  'MIEMBRO_ACEPTADO': 'new_member',
  'MIEMBRO_RECHAZADO': 'request_rejected',
  'TRANSFERENCIA_ADMIN': 'admin_assigned',
  'TRANSFERENCIA_ADMIN_ACEPTADA': 'admin_transfer_accepted',
  'TRANSFERENCIA_ADMIN_RECHAZADA': 'admin_transfer_rejected',
};

export const useSocketNotifications = () => {
  const user = useAuthStore((state) => state.user);
  const { addNotification, markAsRead, removeNotification, clearAll } = useNotificationContext();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !user?.uid) return;

    const handleNotification = (payload: any) => {
      console.log('[Socket] Received notification:', payload);
      
      // Validamos contra el EVENT_MAP del backend
      const backendType = EVENT_MAP[payload.type] || payload.type;
      const friendlyType = FRIENDLY_TYPES[backendType] || backendType;

      addNotification({
        type: friendlyType,
        message: payload.message,
        data: {
          groupId: payload.groupId,
          groupName: payload.groupName,
          ...payload.data
        }
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, user?.uid, addNotification]);

  return {
    markAsRead,
    removeNotification,
    clearAll,
    isConnected,
  };
};
