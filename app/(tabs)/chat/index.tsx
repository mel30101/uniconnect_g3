import { useAuth } from "@/app/context/AuthContext";
import ChatListItem from "@/components/chat/ChatListItem";
import { subscribeToUserChats } from "@/services/chatService";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Chat } from "../../../types/Chat";

export default function ChatListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToUserChats(user.uid, setChats);
    return unsubscribe;
  }, [user]);

  if (!user) {
    return <Text>Cargando...</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatListItem
            chat={item}
            onPress={() =>
              router.push(`/chat/${item.id}`)
            }
          />
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No tienes chats aún
          </Text>
        }
      />
    </View>
  );
}