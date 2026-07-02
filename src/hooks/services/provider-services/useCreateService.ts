import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createService } from '@/services/provider-services';
import type { ServiceInput } from '@/validations/service';

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ServiceInput) => createService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
    },
  });
}
