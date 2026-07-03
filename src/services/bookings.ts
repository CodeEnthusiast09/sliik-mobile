import type { ApiResponse } from '@/interfaces/api-response';
import type { AvailableSlots, Booking } from '@/interfaces/booking';
import type { CreateBookingInput } from '@/validations/booking';

import { apiClient } from './api-client';

export async function createBooking(payload: CreateBookingInput) {
  const { data } = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
  return data;
}

export async function getMyBookings() {
  const { data } = await apiClient.get<ApiResponse<Booking[]>>('/bookings');
  return data;
}

export async function getBookingById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
  return data;
}

export async function confirmBooking(id: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/confirm`);
  return data;
}

export async function declineBooking(id: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/decline`);
  return data;
}

export async function cancelBooking(id: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/cancel`);
  return data;
}

export async function completeBooking(id: string) {
  const { data } = await apiClient.patch<ApiResponse<Booking>>(`/bookings/${id}/complete`);
  return data;
}

export async function getAvailableSlots(providerId: string, date: string, serviceId: string) {
  const { data } = await apiClient.get<ApiResponse<AvailableSlots>>(`/providers/${providerId}/slots`, {
    params: { date, serviceId },
  });
  return data;
}
