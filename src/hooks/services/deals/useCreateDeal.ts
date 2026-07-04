import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDeal } from '@/services/deals';
import type { CreateDealInput } from '@/validations/deal';

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDealInput) => createDeal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'mine'] });
    },
  });
}
