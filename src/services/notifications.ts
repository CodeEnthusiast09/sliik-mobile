import type { ApiResponse, PaginatedResponse } from '@/interfaces/api-response';
import type { AppNotification } from '@/interfaces/notification';

import { apiClient } from './api-client';

export async function getMyNotifications() {
  const { data } = await apiClient.get<PaginatedResponse<AppNotification>>('/notifications');
  return data;
}

export async function getUnreadCount() {
  const { data } = await apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count');
  return data;
}

export async function markAsRead(notificationId: string) {
  const { data } = await apiClient.patch<ApiResponse<AppNotification>>(`/notifications/${notificationId}/read`);
  return data;
}

export async function markAllAsRead() {
  const { data } = await apiClient.patch<ApiResponse<undefined>>('/notifications/read-all');
  return data;
}

export async function registerPushToken(expoPushToken: string, platform: 'ios' | 'android') {
  const { data } = await apiClient.post<ApiResponse<undefined>>('/notifications/push-tokens', {
    expoPushToken,
    platform,
  });
  return data;
}

export async function unregisterPushToken(expoPushToken: string) {
  const { data } = await apiClient.delete<ApiResponse<undefined>>('/notifications/push-tokens', {
    data: { expoPushToken },
  });
  return data;
}
