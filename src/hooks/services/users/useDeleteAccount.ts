import { useMutation } from '@tanstack/react-query';

import { deleteAccount } from '@/services/users';

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (password?: string) => deleteAccount(password),
  });
}
