import { useMutation, useQueryClient } from '@tanstack/react-query';

import { respondToOffer } from '@/services/offers';
import type { RespondToOfferInput } from '@/validations/offer';

export function useRespondToOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, payload }: { offerId: string; payload: RespondToOfferInput }) =>
      respondToOffer(offerId, payload),
    onSuccess: (_data, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'open'] });
      queryClient.invalidateQueries({ queryKey: ['offers', 'responses', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['offers', offerId] });
    },
  });
}
