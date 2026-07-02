import { useMutation } from '@tanstack/react-query';

import { register } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import type { RegisterInput } from '@/validations/auth';

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterInput) => register(payload),
    onSuccess: (response) => {
      if (response.data) {
        setAuth(response.data.accessToken, response.data.role);
      }
    },
  });
}
