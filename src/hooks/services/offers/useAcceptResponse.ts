import { useMutation, useQueryClient } from '@tanstack/react-query';

import { acceptResponse } from '@/services/offers';

export function useAcceptResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, responseId }: { offerId: string; responseId: string }) =>
      acceptResponse(offerId, responseId),
    onSuccess: (_data, { offerId }) => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['offers', offerId] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
