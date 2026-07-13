import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import type { Message, MessageType } from '@/interfaces/chat';
import { createChatSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth';

type PresenceEvent = { userId: string; online: boolean };

function generateClientId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChatSocket(
  bookingId: string,
  otherUserId?: string,
  myUserId?: string,
) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const socketRef = useRef<ReturnType<typeof createChatSocket> | null>(null);
  const queryKey = ['chat', 'messages', bookingId];

  // Keyed by userId rather than a single boolean for "the other party" -
  // otherUserId is usually still unknown (booking still loading) when the
  // socket connects and the initial presence snapshot arrives, so the
  // relevant entry is looked up at read time below instead of trying to
  // catch the event at the one moment the id happened to already be known.
  const [presenceByUserId, setPresenceByUserId] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!accessToken || !bookingId) return;

    const socket = createChatSocket(accessToken);
    socketRef.current = socket;
    // Recomputed locally (not the outer `queryKey`) so it isn't a
    // useEffect dependency - the outer one is a fresh array every render,
    // which would otherwise reconnect the socket on every render.
    const queryKey = ['chat', 'messages', bookingId];

    socket.on('connect', () => {
      socket.emit('joinConversation', { bookingId });
      socket.emit('markRead', { bookingId });
    });

    socket.on('newMessage', (message: Message & { clientId?: string }) => {
      queryClient.setQueryData<Message[]>(queryKey, (previous) => {
        if (!previous) return [message];
        // The sender's own message round-trips back through this same
        // event - replace the optimistic bubble it already rendered
        // instead of appending a second, duplicate one.
        const pendingIndex = message.clientId
          ? previous.findIndex((existing) => existing.id === message.clientId)
          : -1;
        if (pendingIndex === -1) return [...previous, message];
        const next = [...previous];
        next[pendingIndex] = message;
        return next;
      });
      socket.emit('markRead', { bookingId });
      // The chats list (last message preview, ordering, unread state) reads
      // from a separate query that this socket never touched otherwise, so
      // it went stale until a manual pull-to-refresh.
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    });

    socket.on('messagesRead', () => {
      queryClient.invalidateQueries({ queryKey });
      // Clears the unread dot on the chats list once this conversation's
      // messages are marked read, same staleness reason as above.
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    });

    socket.on('presence', (event: PresenceEvent) => {
      setPresenceByUserId((previous) => ({ ...previous, [event.userId]: event.online }));
    });

    socket.on('messageDeleted', (deletedMessage: Message) => {
      queryClient.setQueryData<Message[]>(queryKey, (previous) =>
        previous?.map((message) =>
          message.id === deletedMessage.id ? deletedMessage : message,
        ),
      );
      // The chats list may be showing this message as its last-message
      // preview, which needs to reflect the deletion too.
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, bookingId, queryClient]);

  // Inserts a local placeholder bubble immediately, before the actual send
  // (and, for audio, before the Cloudinary upload it depends on) - the real
  // message replaces it once `newMessage` echoes back with a matching
  // clientId. Returns the id so the caller can pass it back into
  // `sendMessage` once the real content is ready, or into
  // `removePendingMessage` if sending never ends up happening.
  function beginPendingMessage(
    type: MessageType,
    content = '',
    mediaUrl: string | null = null,
  ): string {
    const clientId = generateClientId();
    if (!myUserId) return clientId;

    const pendingMessage: Message = {
      id: clientId,
      conversationId: '',
      senderId: myUserId,
      type,
      content,
      mediaUrl,
      readAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      pending: true,
    };
    queryClient.setQueryData<Message[]>(queryKey, (previous) => [
      ...(previous ?? []),
      pendingMessage,
    ]);
    return clientId;
  }

  function removePendingMessage(clientId: string) {
    queryClient.setQueryData<Message[]>(queryKey, (previous) =>
      previous?.filter((message) => message.id !== clientId),
    );
  }

  function sendMessage(
    content: string,
    options?: { type?: MessageType; mediaUrl?: string; clientId?: string },
  ) {
    // A plain text (or caption-only) send has no earlier upload step, so
    // there's no pre-existing pending bubble yet - insert one now instead
    // of requiring every caller to call beginPendingMessage first.
    const clientId =
      options?.clientId ??
      beginPendingMessage(
        options?.type ?? 'text',
        content,
        options?.mediaUrl ?? null,
      );

    socketRef.current?.emit('sendMessage', {
      bookingId,
      content,
      type: options?.type,
      mediaUrl: options?.mediaUrl,
      clientId,
    });
  }

  function deleteMessage(messageId: string) {
    socketRef.current?.emit('deleteMessage', { messageId });
  }

  const isOtherOnline = otherUserId ? (presenceByUserId[otherUserId] ?? false) : false;

  return {
    sendMessage,
    beginPendingMessage,
    removePendingMessage,
    deleteMessage,
    isOtherOnline,
  };
}
