import { sendMessage as sendMessageUC, sendFileMessage as sendFileMessageUC } from '../../../di/container';
import { useState } from 'react';
import { Button, TextInput, View, Pressable, Text, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/src/presentation/store/useAuthStore';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';

export default function MessageInput({ chatId }: { chatId: string }) {
  const [text, setText] = useState('');
  const user = useAuthStore(state => state.user);
  const insets = useSafeAreaInsets();

  const handleSend = async () => {
    if (!text.trim() || !user) return;
    await sendMessageUC.execute(chatId, text, user.uid);
    setText('');
  };

  const [uploading, setUploading] = useState(false);
  const handlePickFile = async () => {
    if (!user) return;

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setUploading(true);
        const asset = res.assets[0];

        let detectedType = asset.mimeType;
        if (!detectedType && asset.name.toLowerCase().endsWith('.pdf')) {
          detectedType = 'application/pdf';
        }

        const fileToUpload = {
          uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
          type: detectedType || 'application/octet-stream',
          name: asset.name,
          size: asset.size,
          file: asset.file
        };

        await sendFileMessageUC.execute(chatId, user.uid, fileToUpload);
      }
    } catch (err) {
      console.log("Error al seleccionar archivo:", err);
      if (Platform.OS === 'web') {
        window.alert("No se pudo enviar el archivo. Revisa tu conexión.");
      } else {
        Alert.alert("Error", "No se pudo enviar el archivo.");
      }
    } finally {
      setUploading(false);
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
        disabled={uploading}
        style={{ justifyContent: 'center', marginRight: 8, opacity: uploading ? 0.5 : 1 }}
      >
        {uploading ? (
          <ActivityIndicator size="small" color="#4f46e5" />
        ) : (
          <Text style={{ fontSize: 24 }}>📎</Text>
        )}
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
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <Button title="Enviar" onPress={handleSend} color="#4f46e5" />
    </View>
  );
}