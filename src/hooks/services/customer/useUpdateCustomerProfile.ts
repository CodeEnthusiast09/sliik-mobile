import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateMyCustomerProfile } from '@/services/customer';
import type { UpdateCustomerProfileInput } from '@/validations/customer-profile';

export function useUpdateCustomerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCustomerProfileInput) => updateMyCustomerProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer', 'me'] });
    },
  });
}
