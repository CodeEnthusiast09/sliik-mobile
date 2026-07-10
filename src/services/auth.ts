import type { ApiResponse } from '@/interfaces/api-response';
import type { AuthData, RegisterData } from '@/interfaces/auth';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '@/validations/auth';

import { apiClient } from './api-client';

export async function register(payload: RegisterInput) {
  const { data } = await apiClient.post<ApiResponse<RegisterData>>('/auth/register', payload);
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

export async function verifyEmail(payload: VerifyEmailInput) {
  const { data } = await apiClient.post<ApiResponse<AuthData>>('/auth/verify-email', payload);
  return data;
}

export async function resendVerification(payload: ResendVerificationInput) {
  const { data } = await apiClient.post<ApiResponse>('/auth/resend-verification', payload);
  return data;
}
