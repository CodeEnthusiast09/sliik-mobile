import type { ApiResponse } from '@/interfaces/api-response';
import type { CustomerProfile } from '@/interfaces/customer';
import type { UpdateCustomerProfileInput } from '@/validations/customer-profile';

import { apiClient } from './api-client';

export async function getMyCustomerProfile() {
  const { data } = await apiClient.get<ApiResponse<CustomerProfile>>('/customers/me');
  return data;
}

export async function updateMyCustomerProfile(payload: UpdateCustomerProfileInput) {
  const { data } = await apiClient.patch<ApiResponse<CustomerProfile>>('/customers/me', payload);
  return data;
}
