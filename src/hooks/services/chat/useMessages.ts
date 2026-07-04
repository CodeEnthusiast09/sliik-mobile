import { useQuery } from '@tanstack/react-query';

import { getMessages } from '@/services/chat';

export function useMessages(bookingId: string) {
  return useQuery({
    queryKey: ['chat', 'messages', bookingId],
    queryFn: async () => {
      const response = await getMessages(bookingId);
      return response.data;
    },
    enabled: !!bookingId,
  });
}
