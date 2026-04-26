import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Message } from '../../domain/entities/Message';
import { sendGroupMessage as sendGroupMessageUC, sendGroupFileMessage as sendGroupFileMessageUC } from '../../di/container';
import { groupChatRepo } from '../../di/container';

export const useGroupChat = (groupId: string) => {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!groupId) return;

    const unsubscribe = groupChatRepo.subscribeToGroupMessages(groupId, setMessages);

    return () => {
      unsubscribe();
    };
  }, [groupId]);

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
