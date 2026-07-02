import type { ApiResponse } from '@/interfaces/api-response';
import type { AuthData } from '@/interfaces/auth';
import type { LoginInput, RegisterInput } from '@/validations/auth';

import { apiClient } from './api-client';

export async function register(payload: RegisterInput) {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/register', payload);
  return data;
}

export async function login(payload: LoginInput) {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/login', payload);
  return data;
}
