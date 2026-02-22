import { useRouter } from "expo-router";
import { FlatList, Pressable, Text, View } from "react-native";
import { Chat } from "../../../types/Chat";

export default function ChatListScreen() {
  const router = useRouter();

  const chats: Chat[] = [];

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold" }}>Chats</Text>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "./[chatId]",
                params: { chatId: item.id },
              })
            }
          >
            <Text>{item.lastMessage}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}