import { useQuery } from '@tanstack/react-query';

import { getFavoriteStatus } from '@/services/favorites';

export function useFavoriteStatus(providerId: string | undefined) {
  return useQuery({
    queryKey: ['favorites', 'status', providerId],
    queryFn: async () => {
      const response = await getFavoriteStatus(providerId as string);
      return response.data;
    },
    enabled: !!providerId,
  });
}
