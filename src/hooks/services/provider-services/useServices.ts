import { useQuery } from '@tanstack/react-query';

import { getMyServices } from '@/services/provider-services';

export function useServices() {
  return useQuery({
    queryKey: ['provider-services'],
    queryFn: async () => {
      const response = await getMyServices();
      return response.data ?? [];
    },
  });
}
