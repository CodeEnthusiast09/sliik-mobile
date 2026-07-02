import { isAxiosError } from 'axios';

import type { ApiResponse } from '@/interfaces/api-response';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiResponse>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) {
      return message[0] ?? 'Something went wrong';
    }
    if (typeof message === 'string') {
      return message;
    }
  }
  return 'Something went wrong';
}
