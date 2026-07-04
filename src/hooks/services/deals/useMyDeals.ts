import { useQuery } from '@tanstack/react-query';

import { getMyDeals } from '@/services/deals';

export function useMyDeals() {
  return useQuery({
    queryKey: ['deals', 'mine'],
    queryFn: async () => {
      const response = await getMyDeals();
      return response.data ?? [];
    },
  });
}
