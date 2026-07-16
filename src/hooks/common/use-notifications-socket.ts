import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { createNotificationsSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

export function useNotificationsSocket() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!accessToken) return;

    const socket = createNotificationsSocket(accessToken);

    socket.on('newNotification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['chat', 'unread-count'] });
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken, queryClient]);
}
