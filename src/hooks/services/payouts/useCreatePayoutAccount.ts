import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPayoutAccount } from '@/services/payouts';
import type { CreatePayoutAccountInput } from '@/validations/payout';

export function useCreatePayoutAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePayoutAccountInput) => createPayoutAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts', 'me'] });
    },
  });
}
