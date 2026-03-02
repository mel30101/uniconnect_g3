import { db } from '@/config/firebase';
import { subscribeToMessages } from '@/services/chatService';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Text, View } from 'react-native';
import ChatBubble from '../../components/chat/ChatBubble';
import MessageInput from '../../components/chat/MessageInput';
import UCaldasTheme from '../constants/Colors';
import { useAuth } from '../context/AuthContext';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [chatDetails, setChatDetails] = useState<any>(null);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const headerHeight = useHeaderHeight();

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

    <>
      <Stack.Screen
        options={{
          headerShown: true, 
          title: '', 
          headerStyle: {
            backgroundColor: UCaldasTheme.azulOscuro,
          },
          headerTintColor: '#fff', 
          headerTitleAlign: 'left', 
          headerTitle: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: 'https://www.ucaldas.edu.co/portal/wp-content/uploads/2023/06/Logo_80_anos_Universidad_de_Caldas_Blanco.png' }}
                style={{ width: 70, height: 50, marginRight: 10 }}
                resizeMode="contain"
              />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold', maxWidth: 200 }} numberOfLines={1}>
                {otherUserName}
              </Text>
            </View>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={70}
      >

        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          inverted={false}
          contentContainerStyle={{ paddingBottom: 10, flexGrow: 1, justifyContent: 'flex-end' }}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.senderId === user?.uid}
            />
          )}
        />
        <MessageInput chatId={chatId} />
      </KeyboardAvoidingView >
    </>
  );
}