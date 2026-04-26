import { useChat } from '@/src/presentation/hooks/useChat';
import { useHeaderHeight } from '@react-navigation/elements';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { FlatList, Image, Keyboard, KeyboardAvoidingView, Text, View } from 'react-native';
import ChatBubble from '@/src/presentation/components/chat/ChatBubble';
import MessageInput from '@/src/presentation/components/chat/MessageInput';
import UCaldasTheme from '../constants/Colors';

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { messages, otherUserName, user } = useChat(chatId);
  const flatListRef = useRef<FlatList>(null);

  const flatListRef = useRef<FlatList>(null);
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
          ref={flatListRef}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          data={messages}
          keyExtractor={item => item.id}
          inverted={true}
          contentContainerStyle={{ paddingBottom: 10, paddingTop: 10 }}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.senderId === user?.uid}
            />
          )}
        />
        <MessageInput chatId={chatId} />
      </KeyboardAvoidingView>
    </>
  );
}