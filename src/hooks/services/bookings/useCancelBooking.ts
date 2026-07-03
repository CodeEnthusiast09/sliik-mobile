import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelBooking } from '@/services/bookings';

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelBooking(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'available-slots'] });
    },
  });
}
