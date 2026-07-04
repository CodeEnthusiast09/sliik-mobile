import type { ApiResponse } from '@/interfaces/api-response';
import type { Review, UserReviews } from '@/interfaces/review';
import type { CreateReviewInput } from '@/validations/review';

import { apiClient } from './api-client';

export async function createReview(payload: CreateReviewInput) {
  const { data } = await apiClient.post<ApiResponse<Review>>('/reviews', payload);
  return data;
}

export async function getReviewsForBooking(bookingId: string) {
  const { data } = await apiClient.get<ApiResponse<Review[]>>(`/reviews/booking/${bookingId}`);
  return data;
}

export async function getReviewsForUser(userId: string) {
  const { data } = await apiClient.get<ApiResponse<UserReviews>>(`/reviews/user/${userId}`);
  return data;
}
