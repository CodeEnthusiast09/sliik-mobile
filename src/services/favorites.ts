import type { ApiResponse } from '@/interfaces/api-response';
import type { Favorite } from '@/interfaces/favorite';

import { apiClient } from './api-client';

export async function getMyFavorites() {
  const { data } = await apiClient.get<ApiResponse<Favorite[]>>('/favorites');
  return data;
}

export async function addFavorite(providerId: string) {
  const { data } = await apiClient.post<ApiResponse<undefined>>(`/favorites/${providerId}`);
  return data;
}

export async function removeFavorite(providerId: string) {
  const { data } = await apiClient.delete<ApiResponse<undefined>>(`/favorites/${providerId}`);
  return data;
}

export async function getFavoriteStatus(providerId: string) {
  const { data } = await apiClient.get<ApiResponse<{ isFavorited: boolean }>>(
    `/favorites/${providerId}/status`,
  );
  return data;
}
