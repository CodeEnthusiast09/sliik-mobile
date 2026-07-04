import type { ApiResponse } from '@/interfaces/api-response';
import type { ChatConversationSummary, Message } from '@/interfaces/chat';

import { apiClient } from './api-client';

export async function getMyConversations() {
  const { data } = await apiClient.get<ApiResponse<ChatConversationSummary[]>>('/chat/conversations');
  return data;
}

export async function getMessages(bookingId: string) {
  const { data } = await apiClient.get<ApiResponse<Message[]>>(`/chat/booking/${bookingId}/messages`);
  return data;
}
