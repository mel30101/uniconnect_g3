import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Button, FlatList, Text, TextInput, View } from "react-native";
import { getMessages, sendMessage } from "../../../services/chatService";
import { Message } from "../../../types/Message";

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    const data = await getMessages(chatId as string);
    setMessages(data);
  };

  const handleSend = async () => {
    await sendMessage(chatId as string, "UID_USUARIO", text);
    setText("");
    loadMessages();
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.text}</Text>}
      />

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Escribe un mensaje..."
      />
      <Button title="Enviar" onPress={handleSend} />
    </View>
  );
}