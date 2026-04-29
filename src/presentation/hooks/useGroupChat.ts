import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Message } from '../../domain/entities/Message';
import { sendGroupMessage as sendGroupMessageUC, sendGroupFileMessage as sendGroupFileMessageUC } from '../../di/container';
import { groupChatRepo } from '../../di/container';

import { useSocket } from './useSocket';
import { useGroupDetail } from './useGroupDetail';
import { Platform } from 'react-native';

export const useGroupChat = (groupId: string) => {
  const user = useAuthStore((state) => state.user);
  const { socket } = useSocket();
  const { group } = useGroupDetail(groupId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!groupId || !user?.uid || !socket) return;

    // Verify if user is member of the group
    const isMember = group?.members?.some((m: any) => m.id === user.uid);

    // Only join if membership is confirmed
    if (isMember) {
      console.log(`[Socket] Joining group room: ${groupId} for user ${user.uid}`);
      socket.emit('join_group', { groupId, userId: user.uid });

      // Verification log
      console.log(`Usuario [${user.uid}] unido a la sala del grupo [${groupId}]`);

      // Tarea 2: Listener para nuevos mensajes en tiempo real
      const handleNewMessage = (payload: any) => {
        // Normalización: El socket envía 'message_id', 'content' y 'sender.id'
        const normalizedMessage: Message = {
          ...payload,
          id: payload.id || payload.message_id,
          text: payload.text || payload.content,
          senderId: payload.senderId || payload.sender?.id,
          createdAt: payload.createdAt || payload.timestamp,
        };

        console.log('[Observer] Nuevo mensaje normalizado:', normalizedMessage);

        setMessages((prev) => {
          // Prevención de duplicidad: Verificar por ID (ahora normalizado)
          const alreadyExists = prev.some((m) => m.id === normalizedMessage.id);
          if (alreadyExists) return prev;

          // Mantener inmutabilidad y orden
          return [...prev, normalizedMessage];
        });
      };

      socket.on('new_message', handleNewMessage);

      const unsubscribe = groupChatRepo.subscribeToGroupMessages(groupId, setMessages);

      return () => {
        console.log(`[Socket] Leaving group room: ${groupId} and removing listeners`);
        socket.emit('leave_group', { groupId });
        socket.off('new_message', handleNewMessage);
        unsubscribe();
      };
    }

    // Si no es miembro o no se cumple la condición inicial
    return () => { };
  }, [groupId, user?.uid, socket, group?.members]);

  const sendMessage = async (text: string) => {
    if (!user?.uid || isSending) return;

    setIsSending(true);
    try {
      await sendGroupMessageUC.execute(groupId, text, user.uid);
    } catch (error) {
      console.error('[Chat] Error al enviar mensaje:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendFileMessage = async (file: any) => {
    if (!user?.uid || isSending) return;

    setIsSending(true);
    console.log('[HTTP] Preparando envío de archivo:', file.name);

    try {
      await sendGroupFileMessageUC.execute(groupId, user.uid, file);

      console.log('[HTTP] ¡Archivo enviado con éxito!');
    } catch (error: any) {
      console.error('[HTTP] Error al enviar archivo:', error);
      // Opcional: mostrar alerta si el error viene del repo
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || 'Objeto de archivo no soportado'}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages,
    sendMessage,
    sendFileMessage,
    isSending,
    user,
  };
};