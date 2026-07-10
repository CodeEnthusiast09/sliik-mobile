import { useMutation } from '@tanstack/react-query';

import { googleAuth } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { useLocationStore } from '@/store/location';
import type { GoogleAuthInput } from '@/validations/auth';

// Social sign-in is where a Google user becomes authenticated: the backend
// verifies the id token and returns the JWT directly (no email-verify step).
export function useGoogleAuth() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: GoogleAuthInput) => googleAuth(payload),
    onSuccess: (response) => {
      if (response.data) {
        setAuth(response.data.accessToken, response.data.role);
        if (response.data.role === 'customer') {
          useLocationStore.getState().requestLocation();
        }
      }
    },
  });
}
