import type { ApiResponse } from '@/interfaces/api-response';
import type { AuthData } from '@/interfaces/auth';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '@/validations/auth';

import { apiClient } from './api-client';

export async function register(payload: RegisterInput) {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/register', payload);
  return data;
}

export async function login(payload: LoginInput) {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/login', payload);
  return data;
}

export async function forgotPassword(payload: ForgotPasswordInput) {
  const { data } = await apiClient.post<ApiResponse>('/auth/forgot-password', payload);
  return data;
}

export async function resetPassword(payload: ResetPasswordInput) {
  const { data } = await apiClient.post<ApiResponse>('/auth/reset-password', payload);
  return data;
}
