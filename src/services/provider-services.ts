import type { ApiResponse } from '@/interfaces/api-response';
import type { Service } from '@/interfaces/provider';
import type { ServiceInput } from '@/validations/service';

import { apiClient } from './api-client';

export async function getMyServices() {
  const { data } = await apiClient.get<ApiResponse<Service[]>>('/services');
  return data;
}

export async function createService(payload: ServiceInput) {
  const { data } = await apiClient.post<ApiResponse<Service>>('/services', payload);
  return data;
}

export async function updateService(
  id: string,
  payload: Partial<ServiceInput> & { isActive?: boolean },
) {
  const { data } = await apiClient.patch<ApiResponse<Service>>(`/services/${id}`, payload);
  return data;
}

export async function deleteService(id: string) {
  const { data } = await apiClient.delete<ApiResponse<undefined>>(`/services/${id}`);
  return data;
}
