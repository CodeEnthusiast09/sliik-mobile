import { useQuery } from '@tanstack/react-query';

import { getMyCustomerProfile } from '@/services/customer';

export function useCustomerProfile() {
  return useQuery({
    queryKey: ['customer', 'me'],
    queryFn: async () => {
      const response = await getMyCustomerProfile();
      return response.data;
    },
  });
}
