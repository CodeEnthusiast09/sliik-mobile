import { useMutation } from '@tanstack/react-query';

import { initiatePayment } from '@/services/payments';

export function useInitiatePayment() {
  return useMutation({
    mutationFn: (bookingId: string) => initiatePayment(bookingId),
  });
}
