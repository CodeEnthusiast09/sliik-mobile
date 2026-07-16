import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addPortfolioItem } from '@/services/portfolio';

export function useAddPortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      imageUrl: string;
      title: string;
      category: string;
      caption?: string;
    }) => addPortfolioItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', 'me'] });
    },
  });
}
