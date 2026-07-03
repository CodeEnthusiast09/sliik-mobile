import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createBooking } from '@/services/bookings';
import type { CreateBookingInput } from '@/validations/booking';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingInput) => createBooking(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
