import type { Booking } from './booking';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
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
