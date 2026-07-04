import type { ApiResponse } from '@/interfaces/api-response';
import type { Booking } from '@/interfaces/booking';
import type { Offer, OfferResponse } from '@/interfaces/offer';
import type { CreateOfferInput, RespondToOfferInput } from '@/validations/offer';

import { apiClient } from './api-client';

export async function createOffer(payload: CreateOfferInput) {
  const { data } = await apiClient.post<ApiResponse<Offer>>('/offers', payload);
  return data;
}

export async function getMyOffers() {
  const { data } = await apiClient.get<ApiResponse<Offer[]>>('/offers');
  return data;
}

export async function getOpenOffers() {
  const { data } = await apiClient.get<ApiResponse<Offer[]>>('/offers/open');
  return data;
}

export async function getMyResponses() {
  const { data } = await apiClient.get<ApiResponse<OfferResponse[]>>('/offers/responses/mine');
  return data;
}

export async function getOfferById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Offer>>(`/offers/${id}`);
  return data;
}

export async function cancelOffer(id: string) {
  const { data } = await apiClient.delete<ApiResponse<Offer>>(`/offers/${id}`);
  return data;
}

export async function respondToOffer(offerId: string, payload: RespondToOfferInput) {
  const { data } = await apiClient.post<ApiResponse<OfferResponse>>(
    `/offers/${offerId}/respond`,
    payload,
  );
  return data;
}

export async function acceptResponse(offerId: string, responseId: string) {
  const { data } = await apiClient.post<ApiResponse<Booking>>(
    `/offers/${offerId}/responses/${responseId}/accept`,
  );
  return data;
}
