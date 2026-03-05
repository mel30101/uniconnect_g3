import { sendMessage } from '@/services/chatService';
import { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from "../../store/useAuthStore";

export default function MessageInput({ chatId }: { chatId: string }) {
    const [text, setText] = useState('');
    const user = useAuthStore((state) => state.user);
    
    const insets = useSafeAreaInsets(); 

    const handleSend = async () => {
        if (!text.trim() || !user) return;
        await sendMessage(chatId, text, user.uid);
        setText('');
    };

    return (
        <View style={{ 
            flexDirection: 'row', 
            padding: 8, 
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 10), 
            backgroundColor: '#f4f6f8' 
        }}>
            <TextInput
                style={{ flex: 1, borderWidth: 1, borderRadius: 8, padding: 8, marginRight: 8, backgroundColor: '#fff', borderColor: '#e5e7eb' }}
                value={text}
                onChangeText={setText}
                placeholder="Escribe un mensaje..."
            />
            <Button title="Enviar" onPress={handleSend} color="#4f46e5" />
        </View>
    );
}