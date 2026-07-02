import { useQuery } from '@tanstack/react-query';

import { getMyPortfolio } from '@/services/portfolio';

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio', 'me'],
    queryFn: async () => {
      const response = await getMyPortfolio();
      return response.data ?? [];
    },
  });
}
