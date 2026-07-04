import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDeal } from '@/services/deals';

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDeal(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['deals', 'mine'] });
      queryClient.invalidateQueries({ queryKey: ['deals', id] });
    },
  });
}
