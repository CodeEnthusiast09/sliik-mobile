import { useQuery } from '@tanstack/react-query';

import { getMyConversations } from '@/services/chat';

export function useMyConversations() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      const response = await getMyConversations();
      return response.data;
    },
  });
}
