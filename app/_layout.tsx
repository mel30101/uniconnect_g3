import { Stack } from 'expo-router';
import UCaldasTheme from './constants/Colors';

export default function RootLayout() {
  return (
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
  );
}