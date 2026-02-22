import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    // app/(tabs)/_layout.tsx
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
    </Tabs>
  );
}