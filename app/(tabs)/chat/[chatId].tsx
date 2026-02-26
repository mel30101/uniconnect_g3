import { db } from '@/config/firebase';
import { subscribeToMessages } from '@/services/chatService';
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import ChatBubble from '../../../components/chat/ChatBubble';
import MessageInput from '../../../components/chat/MessageInput';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [chatDetails, setChatDetails] = useState<any>(null);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, setMessages);

    const fetchChatDetails = async () => {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        setChatDetails(chatSnap.data());
      }
    };

    fetchChatDetails();

    return unsubscribe;
  }, [chatId]);

  const otherUserId = chatDetails?.participants?.find((id: string) => id !== user?.uid);
  const otherUserName = otherUserId && chatDetails?.participantsInfo?.[otherUserId]?.name
    ? chatDetails.participantsInfo[otherUserId].name
    : 'Cargando...';

  return (
    <View style={{ flex: 1, backgroundColor: '#f4f6f8' }}>

      <Stack.Screen
        options={{
          title: otherUserName, // Cambia "chat/[chatId]" por el nombre
          headerTitleAlign: 'center', // Centra el texto en la barra superior
          //headerBackTitleVisible: false // Opcional: oculta el texto del botón de "Atrás" en iOS
        }}
      />

      <FlatList
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item}
            isOwn={item.senderId === user?.uid}
          />
        )}
      />
      <MessageInput chatId={chatId} />
    </View>
  );
}