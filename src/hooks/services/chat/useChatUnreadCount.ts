import { useQuery } from '@tanstack/react-query';

import { getUnreadCount } from '@/services/chat';

export function useChatUnreadCount() {
  return useQuery({
    queryKey: ['chat', 'unread-count'],
    queryFn: async () => {
      const response = await getUnreadCount();
      return response.data?.count ?? 0;
    },
  });
}
