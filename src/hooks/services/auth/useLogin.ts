import { useMutation } from '@tanstack/react-query';

import { login } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import { useLocationStore } from '@/store/location';
import type { LoginInput } from '@/validations/auth';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginInput) => login(payload),
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
