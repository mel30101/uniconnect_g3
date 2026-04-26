import UCaldasTheme from '@/app/constants/Colors';
import { Pressable, Text, View, Alert, ActivityIndicator, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { useState } from 'react';

export default function ChatBubble({ message, isOwn, senderName, isMentioned, onPrivateMessage }: any) {
  const messageType = message.type ?? "text";
  const [downloading, setDownloading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleDownload = async () => {
    if (!message.fileUrl) return;

    if (Platform.OS === 'web') {
      window.open(message.fileUrl, '_blank');
      return;
    }

    try {
      setDownloading(true);

      const encodedUrl = encodeURI(message.fileUrl);

      const supported = await Linking.canOpenURL(message.fileUrl);
      if (supported) {
        await Linking.openURL(message.fileUrl);
        return;
      }

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
        <View style={{ position: 'relative', zIndex: 10 }}>
          <Pressable onPress={() => setShowMenu(!showMenu)}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#6b7280',
              marginBottom: 4,
            }}>
              {senderName}
            </Text>
          </Pressable>
          {showMenu && (
            <View style={{
              position: 'absolute',
              top: 20,
              left: 0,
              backgroundColor: '#fff',
              padding: 8,
              borderRadius: 6,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              zIndex: 999,
              minWidth: 140,
            }}>
              <Pressable onPress={() => {
                setShowMenu(false);
                if (onPrivateMessage) onPrivateMessage(message.senderId);
              }}>
                <Text style={{ color: '#4f46e5', fontSize: 13, fontWeight: 'bold' }}>💬 Mensaje privado</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {messageType === "text" && renderTextWithMentions(message.text)}

      {messageType === "file" && (() => {
        const formatSize = (bytes?: number) => {
          if (!bytes) return '';
          if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          return `${(bytes / 1024).toFixed(0)} KB`;
        };

        const sizeFormatted = formatSize(message.size);
        const isHeavy = message.size && message.size > 10 * 1024 * 1024;

        const getFileIcon = (name?: string) => {
          if (message.visual_metadata?.icon) return message.visual_metadata.icon;
          const n = name?.toLowerCase() || '';
          if (n.endsWith('.pdf')) return '📕';
          if (n.endsWith('.doc') || n.endsWith('.docx')) return '📘';
          if (n.endsWith('.xls') || n.endsWith('.xlsx')) return '📗';
          if (n.endsWith('.ppt') || n.endsWith('.pptx')) return '📙';
          if (n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg')) return '🖼️';
          if (n.endsWith('.mp4') || n.endsWith('.mov')) return '🎥';
          if (n.endsWith('.zip') || n.endsWith('.rar')) return '📦';
          return '📄';
        };

        return (
          <View style={{ maxWidth: 250 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>
                {getFileIcon(message.fileName)}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={{
                  color: isOwn ? '#fff' : '#000',
                  fontWeight: '600',
                  fontSize: 14,
                }} numberOfLines={1} ellipsizeMode="middle">
                  {message.fileName || 'Archivo'}
                </Text>
                <Text style={{
                  color: isOwn ? '#e0e7ff' : '#6b7280',
                  fontSize: 12,
                }}>
                  {sizeFormatted}
                </Text>
                {isHeavy && (
                  <Text style={{ color: '#f87171', fontSize: 10, marginTop: 2 }}>
                    ⚠️ Archivo pesado
                  </Text>
                )}
              </View>
            </View>

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
                justifyContent: 'center',
              }}>
              {downloading ? (
                <ActivityIndicator size="small" color={isOwn ? '#4f46e5' : '#fff'} />
              ) : (
                <Text style={{
                  color: isOwn ? '#4f46e5' : '#fff',
                  fontWeight: '600',
                }}> {Platform.OS === 'web' ? 'Descargar' : 'Abrir Archivo'} </Text>
              )}
            </Pressable>
          </View>
        );
      })()}
    </View>
  );
}