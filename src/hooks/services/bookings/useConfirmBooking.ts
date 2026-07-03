import { useMutation, useQueryClient } from '@tanstack/react-query';

import { confirmBooking } from '@/services/bookings';

export function useConfirmBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => confirmBooking(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
    },
  });
}
