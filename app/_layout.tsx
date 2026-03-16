import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState, usePathname } from 'expo-router'; 
import { useAuthStore } from '@/src/presentation/store/useAuthStore'; 
import UCaldasTheme from './constants/Colors';

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const [hasHydrated, setHasHydrated] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const navigationState = useRootNavigationState(); 

  // 1. Monitorear la hidratación de Zustand
  useEffect(() => {
    const _hasHydrated = useAuthStore.persist.hasHydrated();
    if (_hasHydrated) {
      setHasHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => setHasHydrated(true));
      return () => unsub();
    }
  }, []);

  // 2. Lógica de redirección
  useEffect(() => {
    // <-- 3. BLOQUEO CLAVE: No hacer nada si la navegación no ha terminado de cargar internamente
    if (!hasHydrated || !navigationState?.key) return; 

    // Validamos en qué grupo estamos
    const isInsidePrivateArea = segments[0] === '(tabs)' || segments[0] === 'chat' || segments[0] === 'group';
    
    // Validamos si estamos en el inicio, en login o perdidos en el 404
    const isAtLoginOrNotFound = pathname === '/' || segments[0] === '+not-found';

    if (!user && isInsidePrivateArea) {
      // Sin sesión y queriendo entrar -> Al Login
      router.replace('/');
    } else if (user && isAtLoginOrNotFound) {
      // Con sesión en el Login o en el 404 -> Directo al Home de eventos
      // NOTA: Asegúrate de que el nombre del archivo de eventos sea 'home' o el que tengas en (tabs)
      router.replace('/(tabs)/home'); 
    }
  }, [user, hasHydrated, segments, navigationState?.key]); // <-- Agregamos navigationState?.key a las dependencias

  // 3. Pantalla de carga (Splash Screen interno)
  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} />
      </View>
    );
  }

  // 4. Tu Stack original
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