import { useAuth } from '@/app/context/AuthContext';
import { sendMessage } from '@/services/chatService';
import { useState } from 'react';
import { Button, TextInput, View } from 'react-native';

export default function MessageInput({ chatId }: { chatId: string }) {
    const [text, setText] = useState('');
    const { user } = useAuth();

    const handleSend = async () => {
        if (!text.trim() || !user) return;
        await sendMessage(chatId, text, user.uid);
        setText('');
    };

    return (
        <View style={{ flexDirection: 'row', padding: 8 }}>
            <TextInput
                style={{ flex: 1, borderWidth: 1, borderRadius: 8, padding: 8 }}
                value={text}
                onChangeText={setText}
            />
            <Button title="Enviar" onPress={handleSend} />
        </View>
    );
}