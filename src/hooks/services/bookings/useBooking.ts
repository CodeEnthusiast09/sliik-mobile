import { useQuery } from '@tanstack/react-query';

import { getBookingById } from '@/services/bookings';

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: async () => {
      const response = await getBookingById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
