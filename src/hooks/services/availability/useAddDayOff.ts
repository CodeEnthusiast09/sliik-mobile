import { useMutation, useQueryClient } from '@tanstack/react-query';

import { addDayOff } from '@/services/availability';
import type { AddDayOffInput } from '@/validations/availability';

export function useAddDayOff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddDayOffInput) => addDayOff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'days-off'] });
    },
  });
}
