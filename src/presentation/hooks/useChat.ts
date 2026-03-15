import { useEffect, useState } from 'react';
import { chatRepo } from '../../di/container';
import { useAuthStore } from '../store/useAuthStore';
import { Message } from '../../domain/entities/Message';
import { sendMessage as sendMessageUC, sendFileMessage as sendFileMessageUC } from '../../di/container';

export const useChat = (chatId: string) => {
  const user = useAuthStore((state) => state.user);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatDetails, setChatDetails] = useState<any>(null);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = chatRepo.subscribeToMessages(chatId, setMessages);

    const fetchDetails = async () => {
      const details = await chatRepo.getChatDetails(chatId);
      setChatDetails(details);
    };
    fetchDetails();

    return unsubscribe;
  }, [chatId]);

  const sendMessage = async (text: string) => {
    if (!user?.uid) return;
    await sendMessageUC.execute(chatId, text, user.uid);
  };

  const sendFileMessage = async (file: any) => {
    if (!user?.uid) return;
    await sendFileMessageUC.execute(chatId, user.uid, file);
  };

  const otherUserId = chatDetails?.participants?.find((id: string) => id !== user?.uid);
  const otherUserName = otherUserId && chatDetails?.participantsInfo?.[otherUserId]?.name
    ? chatDetails.participantsInfo[otherUserId].name
    : 'Cargando...';

  return {
    messages,
    chatDetails,
    otherUserName,
    sendMessage,
    sendFileMessage,
    user,
  };
};
