import { useQuery } from '@tanstack/react-query';

import { getReviewsForUser } from '@/services/reviews';

export function useReviewsForUser(userId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', 'user', userId],
    queryFn: async () => {
      const response = await getReviewsForUser(userId as string);
      return response.data;
    },
    enabled: !!userId,
  });
}
