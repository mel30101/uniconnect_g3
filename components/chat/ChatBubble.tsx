import UCaldasTheme from '@/app/constants/Colors'
import { Text, View } from 'react-native'

export default function ChatBubble({ message, isOwn }: any) {
    return (
        <View style={{
            alignSelf: isOwn ? 'flex-end' : 'flex-start',
            backgroundColor: isOwn ? UCaldasTheme.azulOscuro : '#e5e7eb',
            margin: 8,
            padding: 10,
            borderRadius: 12,
            maxWidth: '70%',
        }}>
            <Text style={{ color: isOwn ? '#fff' : '#000' }}>
                {message.text}
            </Text>
        </View>
    )
}