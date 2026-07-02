import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePortfolioItem } from '@/services/portfolio';

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePortfolioItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'me'] });
    },
  });
}
