import { useQuery } from '@tanstack/react-query';

import { resolveAccountName } from '@/services/payouts';

export function useResolveAccountName(bankCode: string | undefined, accountNumber: string) {
  return useQuery({
    queryKey: ['payouts', 'resolve-account', bankCode, accountNumber],
    queryFn: async () => {
      const response = await resolveAccountName(bankCode!, accountNumber);
      return response.data ?? null;
    },
    enabled: !!bankCode && accountNumber.length === 10,
    retry: false,
  });
}
