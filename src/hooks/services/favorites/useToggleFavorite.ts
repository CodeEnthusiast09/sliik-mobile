import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addFavorite, removeFavorite } from '@/services/favorites';

export function useToggleFavorite(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isFavorited: boolean) =>
      isFavorited ? removeFavorite(providerId) : addFavorite(providerId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['favorites', 'status', providerId],
      });
      queryClient.invalidateQueries({ queryKey: ['favorites', 'mine'] });
    },
  });
}
