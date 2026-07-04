import { useQuery } from '@tanstack/react-query';

import { getMyOffers } from '@/services/offers';

export function useMyOffers() {
  return useQuery({
    queryKey: ['offers', 'mine'],
    queryFn: async () => {
      const response = await getMyOffers();
      return response.data ?? [];
    },
  });
}
