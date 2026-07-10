import { useMutation } from '@tanstack/react-query';

import { register } from '@/services/auth';
import type { RegisterInput } from '@/validations/auth';

// Register no longer authenticates: the account exists but is unverified and
// gets no token. The screen routes to the verify-email step, which is where
// auth is actually established (see useVerifyEmail).
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterInput) => register(payload),
  });
}
