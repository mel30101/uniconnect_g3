import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../../domain/entities/User';
import apiClient from '../../data/sources/ApiClient';

interface AuthState {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const secureStorage = {
  getItem: async (name: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(name);
    }
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
    } else {
      await SecureStore.setItemAsync(name, value);
    }
  },
  removeItem: async (name: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
    } else {
      await SecureStore.deleteItemAsync(name);
    }
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      logout: async () => {
        try {
          await apiClient.post('/auth/logout');
        } catch (error) {
          console.error("[AuthStore] Error logging out:", error);
        }
        set({ user: null, token: null });
      },
      refreshSession: async () => {
        console.log("[AuthStore] refreshSession called.");
        try {
          const res = await apiClient.get('/auth/me');
          console.log("[AuthStore] apiClient response status:", res.status);
          if (res.status === 200) {
            set({ user: res.data as User });
          } else {
            set({ user: null, token: null });
          }
        } catch (error) {
          console.error("[AuthStore] Error refreshing session:", error);
          set({ user: null, token: null });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
    }
  )
);
