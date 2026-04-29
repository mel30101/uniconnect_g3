import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState, usePathname } from 'expo-router';
import { useAuthStore } from '@/src/presentation/store/useAuthStore';
import { NotificationProvider } from '@/src/presentation/context/NotificationContext';
import { useSocketNotifications } from '@/src/presentation/hooks/useSocketNotifications';
import UCaldasTheme from "@/app/constants/Colors";

function NotificationListener() {
  useSocketNotifications();
  return null;
}

export default function RootLayout() {
  const user = useAuthStore((state) => state.user);
  const [hasHydrated, setHasHydrated] = useState(false);

  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const navigationState = useRootNavigationState();

  // 1. Monitorear la hidratación de Zustand y verificar sesión en Web
  useEffect(() => {
    console.log("[Layout] initialize effect triggered. Hydrated:", useAuthStore.persist.hasHydrated());

    const initialize = async () => {
      try {
        if (Platform.OS === 'web') {
          const params = new URLSearchParams(window.location.search);
          if (!params.get('uid')) {
            console.log("[Layout] Refreshing session...");
            await useAuthStore.getState().refreshSession();
            console.log("[Layout] Session refreshed.");
          } else {
            console.log("[Layout] Session found in URL, skipping refreshSession...");
          }
        }
      } catch (e) {
        console.error("[Layout] Error in layout initialize:", e);
      } finally {
        setHasHydrated(true);
        console.log("[Layout] hasHydrated set to true.");
      }
    };

    // Si ya está hidratado, inicializamos. Si no, esperamos al evento.
    if (useAuthStore.persist.hasHydrated()) {
      initialize();
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        console.log("[Layout] Hydration finished callback.");
        initialize();
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || !navigationState?.key) return;

    const isInsidePrivateArea = segments[0] === '(tabs)' || segments[0] === 'chat' || segments[0] === 'group';

    const isAtLoginOrNotFound = pathname === '/' || segments[0] === '+not-found';

    if (!user && isInsidePrivateArea) {
      router.replace('/');
    } else if (user && isAtLoginOrNotFound) {
      router.replace('/(tabs)/home');
    }
  }, [user, hasHydrated, segments, navigationState?.key]);

  if (!hasHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={UCaldasTheme.azulOscuro} />
      </View>
    );
  }

  return (
    <NotificationProvider>
      <NotificationListener />
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
    </NotificationProvider>
  );
}