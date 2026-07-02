import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMyProviderProfile } from '@/services/provider';
import type { UpdateProviderProfileInput } from '@/validations/provider-profile';

export function useUpdateProviderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProviderProfileInput) => updateMyProviderProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider', 'me'] });
    },
  });
}
