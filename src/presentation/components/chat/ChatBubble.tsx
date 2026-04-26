import UCaldasTheme from '@/app/constants/Colors';
import { Pressable, Text, View, Alert, ActivityIndicator, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { useState } from 'react';

export default function ChatBubble({ message, isOwn, senderName, isMentioned }: any) {
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

      const encodedUrl = encodeURI(message.fileUrl);
      
      // Intentar primero con Linking para abrir directamente en iOS/Android
      // especialmente util si compartir falla por extensiones raras.
      const supported = await Linking.canOpenURL(message.fileUrl);
      if (supported) {
        await Linking.openURL(message.fileUrl);
        return;
      }

      // Fallback a descarga y share
      const cleanFileName = message.fileName ? message.fileName.replace(/\s/g, '_') : `file_${Date.now()}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${cleanFileName}`;

      const downloadResult = await FileSystem.downloadAsync(encodedUrl, fileUri);

      if (downloadResult.status === 200) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(downloadResult.uri);
        }
      } else {
        Alert.alert("Error de Servidor", `Cloudinary respondió con código: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error("Error en handleDownload:", error);
      Alert.alert("Error", "No se pudo comunicar con el archivo.");
    } finally {
      setDownloading(false);
    }
  };

  const renderTextWithMentions = (text: string) => {
    if (!text) return null;
    if (!message.hasMention) return <Text style={{ color: isOwn ? '#fff' : '#000' }}>{text}</Text>;

    // Dividimos por espacios pero conservando los delimitadores para redibujarlos después
    const words = text.split(/(\s+)/);
    return (
      <Text style={{ color: isOwn ? '#fff' : '#000' }}>
        {words.map((word, i) => {
          if (word.startsWith('@')) {
            return (
              <Text key={i} style={{ 
                fontWeight: 'bold', 
                color: isOwn ? '#fde047' : '#d97706', 
                backgroundColor: isOwn ? 'rgba(255,255,255,0.2)' : 'rgba(245,158,11,0.2)' 
              }}>
                {word}
              </Text>
            );
          }
          return <Text key={i}>{word}</Text>;
        })}
      </Text>
    );
  };

  return (
    <View style={{
      alignSelf: isOwn ? 'flex-end' : 'flex-start',
      backgroundColor: isOwn ? (isMentioned ? '#1e3a8a' : UCaldasTheme.azulOscuro) : (isMentioned ? '#fef3c7' : '#e5e7eb'),
      margin: 8,
      padding: 10,
      borderRadius: 12,
      maxWidth: '70%',
      borderWidth: isMentioned ? 2 : 0,
      borderColor: isMentioned ? '#f59e0b' : 'transparent',
    }}>
      {!isOwn && senderName && (
        <Text style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: '#6b7280',
          marginBottom: 4,
        }}>
          {senderName}
        </Text>
      )}

      {messageType === "text" && renderTextWithMentions(message.text)}

      {messageType === "file" && (
        <View>
          <Text style={{
            color: isOwn ? '#fff' : '#000',
            fontWeight: '600',
            marginBottom: 6,
          }}> {message.visual_metadata?.icon || '📄'} {message.fileName} </Text>

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