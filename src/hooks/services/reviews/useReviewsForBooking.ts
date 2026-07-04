import { useQuery } from '@tanstack/react-query';

import { getReviewsForBooking } from '@/services/reviews';

export function useReviewsForBooking(bookingId: string) {
  return useQuery({
    queryKey: ['reviews', 'booking', bookingId],
    queryFn: async () => {
      const response = await getReviewsForBooking(bookingId);
      return response.data;
    },
    enabled: !!bookingId,
  });
}
