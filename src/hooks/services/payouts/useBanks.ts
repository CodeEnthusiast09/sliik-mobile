import { useQuery } from '@tanstack/react-query';

import { getBanks } from '@/services/payouts';

export function useBanks() {
  return useQuery({
    queryKey: ['payouts', 'banks'],
    queryFn: async () => {
      const response = await getBanks();
      return response.data ?? [];
    },
    staleTime: 1000 * 60 * 60,
  });
}
