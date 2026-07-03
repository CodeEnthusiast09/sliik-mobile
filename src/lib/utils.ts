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

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sliik is Nigeria-only (single timezone), so dates/times are treated as
// plain UTC-equivalent clock-face values throughout - matches the backend's
// own slot computation (see providers.service.ts::getAvailableSlots).
export function getNextDates(count: number): string[] {
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(todayUtc + i * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  });
}

export function formatDateLabel(dateStr: string): string {
  const [today, tomorrow] = getNextDates(2);
  if (dateStr === today) return 'Today';
  if (dateStr === tomorrow) return 'Tomorrow';

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  return `${WEEKDAY_LABELS[date.getUTCDay()]} ${date.getUTCDate()}`;
}

export function formatTimeLabel(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

export function formatDateTimeLabel(isoDateTime: string): string {
  return `${formatDateLabel(isoDateTime.slice(0, 10))}, ${formatTimeLabel(isoDateTime)}`;
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
