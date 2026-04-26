import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '../../domain/entities/User';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      refreshSession: async () => {
        console.log("[AuthStore] refreshSession called.");
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

          const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/me`, {
            credentials: 'include',
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          console.log("[AuthStore] fetch response status:", res.status);
          if (res.ok) {
            const data = await res.json();
            set({ user: data });
          } else {
            set({ user: null });
          }
        } catch (error) {
          console.error("[AuthStore] Error refreshing session:", error);
          set({ user: null });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
