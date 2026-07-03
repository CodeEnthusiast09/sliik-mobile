import { useQuery } from '@tanstack/react-query';

import { getMyBookings } from '@/services/bookings';

export function useMyBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await getMyBookings();
      return response.data ?? [];
    },
  });
}
