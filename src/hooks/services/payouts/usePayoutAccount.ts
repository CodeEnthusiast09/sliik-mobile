import { useQuery } from '@tanstack/react-query';

import { getMyPayoutAccount } from '@/services/payouts';

export function usePayoutAccount() {
  return useQuery({
    queryKey: ['payouts', 'me'],
    queryFn: async () => {
      const response = await getMyPayoutAccount();
      return response.data ?? null;
    },
  });
}
