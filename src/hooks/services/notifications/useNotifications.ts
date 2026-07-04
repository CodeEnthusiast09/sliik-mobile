import { useQuery } from '@tanstack/react-query';

import { getMyNotifications } from '@/services/notifications';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: async () => {
      const response = await getMyNotifications();
      return response.data ?? [];
    },
  });
}
