import type { Booking } from './booking';

export type MessageType = 'text' | 'image' | 'audio';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content: string;
  mediaUrl: string | null;
  readAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  // Client-only: set on an optimistic bubble inserted before the socket
  // round trip confirms it, never present on a message from the server.
  pending?: boolean;
}

export interface Conversation {
  id: string;
  bookingId: string;
  createdAt: string;
  messages: Message[];
}

export interface ChatConversationSummary extends Booking {
  conversation: Conversation;
}
