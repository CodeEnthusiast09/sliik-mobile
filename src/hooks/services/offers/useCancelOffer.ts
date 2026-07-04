import { useMutation, useQueryClient } from '@tanstack/react-query';

import { cancelOffer } from '@/services/offers';

export function useCancelOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelOffer(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['offers', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['offers', id] });
    },
  });
}
