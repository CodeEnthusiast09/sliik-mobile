import type { ApiResponse } from '@/interfaces/api-response';
import type { ProviderProfile } from '@/interfaces/provider';
import type { UpdateProviderProfileInput } from '@/validations/provider-profile';

import { apiClient } from './api-client';

export async function getMyProviderProfile() {
  const { data } = await apiClient.get<ApiResponse<ProviderProfile>>('/providers/me');
  return data;
}

export async function updateMyProviderProfile(payload: UpdateProviderProfileInput) {
  const { data } = await apiClient.patch<ApiResponse<ProviderProfile>>('/providers/me', payload);
  return data;
}
