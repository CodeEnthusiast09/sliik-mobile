import { useMutation } from '@tanstack/react-query';

import { resetPassword } from '@/services/auth';
import type { ResetPasswordInput } from '@/validations/auth';

export function useResetPassword() {
  return useMutation({
    mutationFn: (payload: ResetPasswordInput) => resetPassword(payload),
  });
}
