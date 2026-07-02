import type { ApiResponse } from '@/interfaces/api-response';
import type { Bank, PayoutAccount } from '@/interfaces/provider';
import type { CreatePayoutAccountInput } from '@/validations/payout';

import { apiClient } from './api-client';

export async function getBanks() {
  const { data } = await apiClient.get<ApiResponse<Bank[]>>('/payouts/banks');
  return data;
}

export async function getMyPayoutAccount() {
  const { data } = await apiClient.get<ApiResponse<PayoutAccount | undefined>>('/payouts/me');
  return data;
}

export async function createPayoutAccount(payload: CreatePayoutAccountInput) {
  const { data } = await apiClient.post<ApiResponse<PayoutAccount>>('/payouts', payload);
  return data;
}
