import * as Location from 'expo-location';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { secureStorage } from '@/store/auth';
import { showToast } from '@/store/toast';

interface LocationState {
  coords: { lat: number; lng: number } | null;
  requested: boolean;
  requestLocation: (force?: boolean) => Promise<boolean>;
}

/** Requested once right after a customer logs in or registers (also
 * defensively on Home/provider-detail mount, since an already-logged-in
 * session never re-fires that), so Home can silently sort/filter providers
 * by distance without a manual toggle. `coords` persists across app
 * restarts so distance still shows immediately on relaunch; `requested`
 * deliberately doesn't, so a fresh app launch still asks again for an
 * up-to-date fix rather than being stuck on a stale one forever. */
export const useLocationStore = create<LocationState>()(
  persist(
    (set, get) => ({
      coords: null,
      requested: false,
      requestLocation: async (force = false) => {
        if (get().requested && !force) return Boolean(get().coords);
        set({ requested: true });

        try {
          const permission = await Location.requestForegroundPermissionsAsync();
          if (!permission.granted) {
            showToast(
              'Enable location to browse providers near you',
              'default',
            );
            return false;
          }

          const position = await Location.getCurrentPositionAsync({});
          set({
            coords: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
          return true;
        } catch {
          showToast(
            'We could not get your location. Choose a city instead.',
            'error',
          );
          return false;
        }
      },
    }),
    {
      name: 'sliik-location',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state) => ({ coords: state.coords }),
    },
  ),
);
