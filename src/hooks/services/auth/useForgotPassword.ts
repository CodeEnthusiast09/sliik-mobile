import { useMutation } from '@tanstack/react-query';

import { forgotPassword } from '@/services/auth';
import type { ForgotPasswordInput } from '@/validations/auth';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordInput) => forgotPassword(payload),
  });
}
