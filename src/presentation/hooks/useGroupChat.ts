import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Message } from '../../domain/entities/Message';
import { sendGroupMessage as sendGroupMessageUC, sendGroupFileMessage as sendGroupFileMessageUC } from '../../di/container';
import { groupChatRepo } from '../../di/container';

import { useSocket } from './useSocket';
import { useGroupDetail } from './useGroupDetail';

export const useGroupChat = (groupId: string) => {
  const user = useAuthStore((state) => state.user);
  const { socket } = useSocket();
  const { group } = useGroupDetail(groupId);
  const [messages, setMessages] = useState<Message[]>([]);

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
      const handleNewMessage = (newMessage: Message) => {
        console.log('[Observer] Nuevo mensaje recibido en tiempo real:', newMessage);

        setMessages((prev) => {
          // Prevención de duplicidad: Verificar por ID
          const alreadyExists = prev.some((m) => m.id === newMessage.id);
          if (alreadyExists) return prev;

          // Mantener inmutabilidad y orden
          return [...prev, newMessage];
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
    if (!user?.uid) return;
    await sendGroupMessageUC.execute(groupId, text, user.uid);
  };

  const sendFileMessage = async (file: any) => {
    if (!user?.uid) return;
    await sendGroupFileMessageUC.execute(groupId, user.uid, file);
  };

  return {
    messages,
    sendMessage,
    sendFileMessage,
    user,
  };
};