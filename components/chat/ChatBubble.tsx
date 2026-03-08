import UCaldasTheme from '@/app/constants/Colors'
import { Linking, Pressable,Text, View } from 'react-native'

export default function ChatBubble({ message, isOwn }: any) {
  const messageType = message.type ?? "text";

  const handleDownload = () => {
    if (message.fileUrl) {
      Linking.openURL(message.fileUrl);
    }
  };

  return (
    <View
      style={{
        alignSelf: isOwn ? 'flex-end' : 'flex-start',
        backgroundColor: isOwn ? UCaldasTheme.azulOscuro : '#e5e7eb',
        margin: 8,
        padding: 10,
        borderRadius: 12,
        maxWidth: '70%',
      }}>
      {messageType === "text" && (
        <Text style={{ color: isOwn ? '#fff' : '#000' }}>
          {message.text}
        </Text>
      )}

      {messageType === "file" && (
        <View>
          <Text
            style={{
              color: isOwn ? '#fff' : '#000',
              fontWeight: '600',
              marginBottom: 6,
            }}> {message.fileName}
          </Text>

          <Pressable
            onPress={handleDownload}
            style={{
              backgroundColor: isOwn ? '#fff' : '#4f46e5',
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 6,
              alignSelf: 'flex-start',
            }}>
            <Text
              style={{
                color: isOwn ? '#4f46e5' : '#fff',
                fontWeight: '600',
              }}> Descargar </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}