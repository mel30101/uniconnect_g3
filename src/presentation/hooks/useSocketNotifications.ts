import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationContext } from '../context/NotificationContext';

// Event mappings from Backend to internal types
const EVENT_MAP: Record<string, string> = {
  'SOLICITUD_INGRESO': 'SOLICITUD_INGRESO',
  'TRANSFERENCIA_ADMIN_SOLICITADA': 'TRANSFERENCIA_ADMIN_SOLICITADA',
  'MIEMBRO_ACEPTADO': 'MIEMBRO_ACEPTADO',
  'MIEMBRO_RECHAZADO': 'MIEMBRO_RECHAZADO',
  'TRANSFERENCIA_ADMIN': 'TRANSFERENCIA_ADMIN',
  'TRANSFERENCIA_ADMIN_ACEPTADA': 'TRANSFERENCIA_ADMIN_ACEPTADA',
  'TRANSFERENCIA_ADMIN_RECHAZADA': 'TRANSFERENCIA_ADMIN_RECHAZADA',
};

// Internal friendly types requested by the user
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
  const { notifications, addNotification, markAsRead, removeNotification, clearAll } = useNotificationContext();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Determine Socket URL. 
    // In a real environment, this should be the Gateway if it proxies WS, 
    // or the specific service URL.
    const socketUrl = process.env.EXPO_PUBLIC_SOCIAL_SERVICE_URL || 'http://localhost:3003';

    console.log(`[Socket] Connecting to ${socketUrl} for user ${user.uid}`);

    const socket = io(socketUrl, {
      query: { userId: user.uid },
      transports: ['websocket'], // Ensure websocket transport
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to notification server');
    });

    socket.on('notification', (payload: any) => {
      console.log('[Socket] Received notification:', payload);

      const backendType = payload.type;
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
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from notification server');
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    return () => {
      console.log('[Socket] Cleaning up connection');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.uid, addNotification]);

  return {
    notifications,
    markAsRead,
    removeNotification,
    clearAll,
    isConnected: socketRef.current?.connected || false,
  };
};
