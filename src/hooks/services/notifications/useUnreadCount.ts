import { useQuery } from '@tanstack/react-query';

import { getUnreadCount } from '@/services/notifications';

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const response = await getUnreadCount();
      return response.data?.count ?? 0;
    },
  });
}
