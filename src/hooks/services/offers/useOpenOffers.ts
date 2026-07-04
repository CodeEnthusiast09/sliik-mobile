import { useQuery } from '@tanstack/react-query';

import { getOpenOffers } from '@/services/offers';

export function useOpenOffers() {
  return useQuery({
    queryKey: ['offers', 'open'],
    queryFn: async () => {
      const response = await getOpenOffers();
      return response.data ?? [];
    },
  });
}
