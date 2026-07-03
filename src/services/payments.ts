import type { ApiResponse } from '@/interfaces/api-response';

import { apiClient } from './api-client';

export async function initiatePayment(bookingId: string) {
  const { data } = await apiClient.post<ApiResponse<{ checkoutUrl: string; reference: string }>>(
    '/payments/initiate',
    { bookingId },
  );
  return data;
}
