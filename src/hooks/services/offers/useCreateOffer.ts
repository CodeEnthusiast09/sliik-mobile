import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createOffer } from '@/services/offers';
import type { CreateOfferInput } from '@/validations/offer';

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOfferInput) => createOffer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'mine'] });
    },
  });
}
