import { useQuery } from '@tanstack/react-query';

import { getMyResponses } from '@/services/offers';

export function useMyResponses() {
  return useQuery({
    queryKey: ['offers', 'responses', 'mine'],
    queryFn: async () => {
      const response = await getMyResponses();
      return response.data ?? [];
    },
  });
}
