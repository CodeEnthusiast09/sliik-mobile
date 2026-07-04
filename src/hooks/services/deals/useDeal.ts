import { useQuery } from '@tanstack/react-query';

import { getDealById } from '@/services/deals';

export function useDeal(id: string) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: async () => {
      const response = await getDealById(id);
      return response.data;
    },
    enabled: !!id,
  });
}
