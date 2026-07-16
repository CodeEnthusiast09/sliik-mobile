import type { ApiResponse } from '@/interfaces/api-response';
import type { PortfolioItem } from '@/interfaces/provider';

import { apiClient } from './api-client';

export async function getMyPortfolio() {
  const { data } = await apiClient.get<ApiResponse<PortfolioItem[]>>('/portfolio/me');
  return data;
}

export async function addPortfolioItem(payload: {
  imageUrl: string;
  title: string;
  category: string;
  caption?: string;
}) {
  const { data } = await apiClient.post<ApiResponse<PortfolioItem>>('/portfolio', payload);
  return data;
}

export async function deletePortfolioItem(id: string) {
  const { data } = await apiClient.delete<ApiResponse<undefined>>(`/portfolio/${id}`);
  return data;
}

export async function reorderPortfolio(orderedIds: string[]) {
  const { data } = await apiClient.patch<ApiResponse<undefined>>('/portfolio/reorder', {
    orderedIds,
  });
  return data;
}
