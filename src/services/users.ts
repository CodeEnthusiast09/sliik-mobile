import type { ApiResponse } from '@/interfaces/api-response';

import { apiClient } from './api-client';

export async function deleteAccount(password?: string) {
  const { data } = await apiClient.delete<ApiResponse>('/users/me', {
    data: password ? { password } : {},
  });
  return data;
}
