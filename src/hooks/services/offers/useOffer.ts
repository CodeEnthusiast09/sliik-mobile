import { useQuery } from '@tanstack/react-query';

import { getOfferById } from '@/services/offers';

export function useOffer(id: string) {
  return useQuery({
    queryKey: ['offers', id],
    queryFn: async () => {
      const response = await getOfferById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
