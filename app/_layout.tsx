import { Stack } from 'expo-router';
import UCaldasTheme from './constants/Colors';
import AuthProvider from './context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat/[chatId].tsx"
          options={{
            headerStyle: { backgroundColor: UCaldasTheme.azulOscuro },
            headerTintColor: '#fff', 
            title: '' 
          }}
        />
    </Stack>
    </AuthProvider >
  );
}