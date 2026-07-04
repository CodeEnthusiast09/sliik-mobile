import { create } from 'zustand';

interface PushTokenState {
  token: string | null;
  setToken: (token: string | null) => void;
}

// Not persisted - re-derived on each app start via registerForPushNotificationsAsync,
// only kept here so the logout flow can unregister the exact token it registered.
export const usePushTokenStore = create<PushTokenState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));
