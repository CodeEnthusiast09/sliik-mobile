import { useQuery } from '@tanstack/react-query';

import { getMyProviderProfile } from '@/services/provider';

export function useProviderProfile(enabled = true) {
  return useQuery({
    queryKey: ['provider', 'me'],
    queryFn: async () => {
      const response = await getMyProviderProfile();
      return response.data;
    },
    enabled,
  });
}
