import { useMutation, useQueryClient } from '@tanstack/react-query';

import { setSchedule } from '@/services/availability';
import type { SetScheduleInput } from '@/validations/availability';

export function useSetSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetScheduleInput) => setSchedule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', 'schedule'] });
    },
  });
}
