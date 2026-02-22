import { Pressable, Text } from 'react-native';

export default function ChatListItem({ chat, onPress }: any) {
    return (
        <Pressable
            onPress={onPress}
            style={{
                padding: 16,
                borderBottomWidth: 1,
                borderColor: '#e5e7eb',
            }}
        >
            <Text style={{ fontWeight: '600', fontSize: 16 }}>
                Chat
            </Text>

            {chat.lastMessage && (
                <Text style={{ color: '#6b7280', marginTop: 4 }}>
                    {chat.lastMessage}
                </Text>
            )}
        </Pressable>
    );
}