import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateService } from '@/services/provider-services';
import type { ServiceInput } from '@/validations/service';

interface UpdateServiceArgs {
  id: string;
  payload: Partial<ServiceInput> & { isActive?: boolean };
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateServiceArgs) => updateService(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-services'] });
    },
  });
}
