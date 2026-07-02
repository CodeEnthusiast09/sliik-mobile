import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { UserRole } from '@/interfaces/auth';

interface AuthState {
  accessToken: string | null;
  role: UserRole | null;
  isHydrated: boolean;
  setAuth: (accessToken: string, role: UserRole) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

// expo-secure-store has no web implementation, so persist through
// localStorage on web and the native secure keychain everywhere else.
const secureStorage = {
  getItem: (name: string) => {
    if (Platform.OS === 'web') {
      return Promise.resolve(localStorage.getItem(name));
    }
    return SecureStore.getItemAsync(name);
  },
  setItem: (name: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(name, value);
      return Promise.resolve();
    }
    return SecureStore.setItemAsync(name, value);
  },
  removeItem: (name: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(name);
      return Promise.resolve();
    }
    return SecureStore.deleteItemAsync(name);
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      isHydrated: false,
      setAuth: (accessToken, role) => set({ accessToken, role }),
      clearAuth: () => set({ accessToken: null, role: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'sliik-auth',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ accessToken: state.accessToken, role: state.role }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
