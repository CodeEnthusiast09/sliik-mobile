import { useMutation, useQueryClient } from '@tanstack/react-query';

import { removeDayOff } from '@/services/availability';

export function useRemoveDayOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeDayOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'days-off'] });
    },
  });
}
