import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reorderPortfolio } from '@/services/portfolio';

export function useReorderPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderPortfolio(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'me'] });
    },
  });
}
