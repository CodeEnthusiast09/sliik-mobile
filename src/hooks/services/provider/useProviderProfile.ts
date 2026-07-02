import { useQuery } from '@tanstack/react-query';

import { getMyProviderProfile } from '@/services/provider';

export function useProviderProfile() {
  return useQuery({
    queryKey: ['provider', 'me'],
    queryFn: async () => {
      const response = await getMyProviderProfile();
      return response.data;
    },
  });
}
