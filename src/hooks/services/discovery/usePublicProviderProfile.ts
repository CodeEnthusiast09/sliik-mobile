import { useQuery } from '@tanstack/react-query';

import { getProviderProfile } from '@/services/discovery';

export function usePublicProviderProfile(id: string) {
  return useQuery({
    queryKey: ['discovery', 'provider', id],
    queryFn: async () => {
      const response = await getProviderProfile(id);
      return response.data;
    },
    enabled: !!id,
  });
}
