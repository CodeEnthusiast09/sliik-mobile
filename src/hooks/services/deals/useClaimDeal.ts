import { useMutation, useQueryClient } from '@tanstack/react-query';

import { claimDeal } from '@/services/deals';
import type { ClaimDealInput } from '@/validations/deal';

export function useClaimDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dealId, payload }: { dealId: string; payload: ClaimDealInput }) =>
      claimDeal(dealId, payload),
    onSuccess: (_data, { dealId }) => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
