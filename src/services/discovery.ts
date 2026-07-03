import type { ApiResponse, PaginatedResponse } from '@/interfaces/api-response';
import type { ProviderProfile, ProvidersQuery } from '@/interfaces/provider';

import { apiClient } from './api-client';

export async function getProviders(query: ProvidersQuery) {
  const { data } = await apiClient.get<PaginatedResponse<ProviderProfile>>('/providers', {
    params: query,
  });
  return data;
}

export async function getProviderProfile(id: string) {
  const { data } = await apiClient.get<ApiResponse<ProviderProfile>>(`/providers/${id}`);
  return data;
}
