import { useMutation, useQueryClient } from '@tanstack/react-query';

import { declineBooking } from '@/services/bookings';

export function useDeclineBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => declineBooking(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'available-slots'] });
    },
  });
}
