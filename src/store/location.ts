import * as Location from 'expo-location';
import { create } from 'zustand';

import { showToast } from '@/store/toast';

interface LocationState {
  coords: { lat: number; lng: number } | null;
  requested: boolean;
  requestLocation: () => Promise<void>;
}

/** Requested once right after a customer logs in or registers, so Home can
 * silently sort/filter providers by distance without a manual toggle. */
export const useLocationStore = create<LocationState>((set, get) => ({
  coords: null,
  requested: false,
  requestLocation: async () => {
    if (get().requested) return;
    set({ requested: true });

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      showToast('Enable location to see providers near you', 'default');
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    set({
      coords: { lat: position.coords.latitude, lng: position.coords.longitude },
    });
  },
}));
