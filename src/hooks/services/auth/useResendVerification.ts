import { useMutation } from '@tanstack/react-query';

import { resendVerification } from '@/services/auth';
import type { ResendVerificationInput } from '@/validations/auth';

export function useResendVerification() {
  return useMutation({
    mutationFn: (payload: ResendVerificationInput) => resendVerification(payload),
  });
}
