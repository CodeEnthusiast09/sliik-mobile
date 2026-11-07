import { useMutation } from '@tanstack/react-query';

import { verifyEmail } from '@/services/auth';
import { useAuthStore } from '@/store/auth';
import type { VerifyEmailInput } from '@/validations/auth';

// Verifying the email is the point where a password signup actually becomes
// authenticated - the backend returns the JWT here, not at register/login.
export function useVerifyEmail() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: VerifyEmailInput) => verifyEmail(payload),
    onSuccess: (response) => {
      if (response.data) {
        setAuth(response.data.accessToken, response.data.role);
      }
    },
  });
}
