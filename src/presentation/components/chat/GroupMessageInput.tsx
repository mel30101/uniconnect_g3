import { useGroupChat } from '../../hooks/useGroupChat';
import { useState } from 'react';
import { Button, TextInput, View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

export default function GroupMessageInput({ groupId }: { groupId: string }) {
  const [text, setText] = useState('');
  const { sendMessage, sendFileMessage, user } = useGroupChat(groupId);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    await sendMessage(text);
    setText('');
  };

  const handlePickFile = async () => {
    if (!user) return;

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        let detectedType = asset.mimeType;
        if (!detectedType && asset.name.toLowerCase().endsWith('.pdf')) {
          detectedType = 'application/pdf';
        }

        const fileToUpload = {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          type: detectedType || 'application/octet-stream',
          name: asset.name,
          size: asset.size
        };

        await sendFileMessage(fileToUpload);
      }
    } catch (err) {
      console.log("Error al seleccionar archivo:", err);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 8,
        paddingTop: 10,
        paddingBottom: Math.max(insets.bottom, 10),
        backgroundColor: '#f4f6f8',
      }}
    >
      <Pressable
        onPress={handlePickFile}
        style={{ justifyContent: 'center', marginRight: 8 }}
      >
        <Text style={{ fontSize: 24 }}>📎</Text>
      </Pressable>

      <TextInput
        style={{
          flex: 1,
          borderWidth: 1,
          borderRadius: 8,
          padding: 8,
          marginRight: 8,
          backgroundColor: '#fff',
          borderColor: '#e5e7eb',
        }}
        value={text}
        onChangeText={setText}
        placeholder="Escribe un mensaje..."
      />
      <Button title="Enviar" onPress={handleSend} color="#4f46e5" />
    </View>
  );
}
