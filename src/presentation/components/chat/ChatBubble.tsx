import UCaldasTheme from '@/app/constants/Colors';
import { Pressable, Text, View, Alert, ActivityIndicator, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';

export default function ChatBubble({ message, isOwn }: any) {
  const messageType = message.type ?? "text";
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!message.fileUrl) return;

    if (Platform.OS === 'web') {
      window.open(message.fileUrl, '_blank');
      return;
    }

    try {
      setDownloading(true);

      const cleanFileName = message.fileName ? message.fileName.replace(/\s/g, '_') : `file_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;

      const encodedUrl = encodeURI(message.fileUrl);

      console.log("Intentando descargar de:", encodedUrl);

      const downloadResult = await FileSystem.downloadAsync(encodedUrl, fileUri);

      console.log("Status de la descarga:", downloadResult.status);

      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        }
      } else {
        Alert.alert("Error de Servidor", `Cloudinary respondió con código: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error("Error en handleDownload:", error);
      Alert.alert("Error", "No se pudo conectar con el servidor de archivos.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View style={{
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
      backgroundColor: isOwn ? UCaldasTheme.azulOscuro : '#e5e7eb',
      margin: 8,
      padding: 10,
      borderRadius: 12,
      maxWidth: '70%',
    }}>
      {messageType === "text" && (
        <Text style={{ color: isOwn ? '#fff' : '#000' }}>{message.text}</Text>
      )}

      {messageType === "file" && (
        <View>
          <Text style={{
            color: isOwn ? '#fff' : '#000',
            fontWeight: '600',
            marginBottom: 6,
          }}> 📄 {message.fileName} </Text>

          <Pressable
            onPress={handleDownload}
            disabled={downloading}
            style={{
              backgroundColor: isOwn ? '#fff' : '#4f46e5',
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {downloading ? (
              <ActivityIndicator size="small" color={isOwn ? '#4f46e5' : '#fff'} />
            ) : (
              <Text style={{
                color: isOwn ? '#4f46e5' : '#fff',
                fontWeight: '600',
              }}> Abrir Archivo </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}