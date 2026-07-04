import { useQuery } from '@tanstack/react-query';

import { getActiveDeals } from '@/services/deals';

export function useActiveDeals() {
  return useQuery({
    queryKey: ['deals', 'active'],
    queryFn: async () => {
      const response = await getActiveDeals();
      return response.data ?? [];
    },
  });
}
