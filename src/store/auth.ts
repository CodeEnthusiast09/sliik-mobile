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
// Known tradeoff: localStorage is readable by any script on the page (XSS
// risk), unlike SecureStore's OS-level encryption. Accepted for now since
// Sliik is mobile-only and web is a dev/testing target, not a shipped
// surface. If web ever ships for real, this should move to an httpOnly
// cookie issued by the backend instead.
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
