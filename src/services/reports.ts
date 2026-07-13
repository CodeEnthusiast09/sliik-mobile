import type { ApiResponse } from '@/interfaces/api-response';

import { apiClient } from './api-client';

export type CreateReportPayload = {
  reportedUserId: string;
  bookingId?: string;
  reason: string;
};

export async function createReport(payload: CreateReportPayload) {
  const { data } = await apiClient.post<ApiResponse<undefined>>('/reports', payload);
  return data;
}
