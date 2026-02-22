import { subscribeToMessages } from '@/services/chatService';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import ChatBubble from '../../../components/chat/ChatBubble';
import MessageInput from '../../../components/chat/MessageInput';
import { useAuth } from '../../context/AuthContext';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  return (
    <View style={{ flex: 1 }}>
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