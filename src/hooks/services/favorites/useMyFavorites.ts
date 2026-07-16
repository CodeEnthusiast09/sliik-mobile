import { useQuery } from '@tanstack/react-query';

import { getMyFavorites } from '@/services/favorites';

export function useMyFavorites() {
  return useQuery({
    queryKey: ['favorites', 'mine'],
    queryFn: async () => {
      const response = await getMyFavorites();
      return response.data ?? [];
    },
  });
}
