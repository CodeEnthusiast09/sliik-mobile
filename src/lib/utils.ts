import { isAxiosError } from 'axios';

import type { ApiResponse } from '@/interfaces/api-response';

// Haversine great-circle distance in km, mirrors the backend's GET /providers
// radius filter formula - the API filters by radius but doesn't return or sort
// by distance, so "X km away" and nearest-first ordering are computed here.
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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
