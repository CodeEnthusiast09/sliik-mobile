import type { ApiResponse } from '@/interfaces/api-response';
import type { Booking } from '@/interfaces/booking';
import type { Deal } from '@/interfaces/deal';
import type { ClaimDealInput, CreateDealInput } from '@/validations/deal';

import { apiClient } from './api-client';

export async function createDeal(payload: CreateDealInput) {
  const { data } = await apiClient.post<ApiResponse<Deal>>('/deals', payload);
  return data;
}

export async function getActiveDeals() {
  const { data } = await apiClient.get<ApiResponse<Deal[]>>('/deals');
  return data;
}

export async function getMyDeals() {
  const { data } = await apiClient.get<ApiResponse<Deal[]>>('/deals/mine');
  return data;
}

export async function getDealById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Deal>>(`/deals/${id}`);
  return data;
}

export async function deleteDeal(id: string) {
  const { data } = await apiClient.delete<ApiResponse<undefined>>(`/deals/${id}`);
  return data;
}

export async function claimDeal(dealId: string, payload: ClaimDealInput) {
  const { data } = await apiClient.post<ApiResponse<Booking>>(`/deals/${dealId}/claim`, payload);
  return data;
}
