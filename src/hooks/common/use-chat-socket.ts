import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import type { Message } from '@/interfaces/chat';
import { createChatSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

export function useChatSocket(bookingId: string) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);

  useEffect(() => {
    if (!accessToken || !bookingId) return;

    const socket = createChatSocket(accessToken);
    socketRef.current = socket;
    const queryKey = ['chat', 'messages', bookingId];

    socket.on('connect', () => {
      socket.emit('joinConversation', { bookingId });
      socket.emit('markRead', { bookingId });
    });

    socket.on('newMessage', (message: Message) => {
      queryClient.setQueryData<Message[]>(queryKey, (previous) => [...(previous ?? []), message]);
      socket.emit('markRead', { bookingId });
    });

    socket.on('messagesRead', () => {
      queryClient.invalidateQueries({ queryKey });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, bookingId, queryClient]);

  function sendMessage(content: string) {
    socketRef.current?.emit('sendMessage', { bookingId, content });
  }

  return { sendMessage };
}
