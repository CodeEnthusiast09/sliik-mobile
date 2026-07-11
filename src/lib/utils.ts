import Ionicons from '@expo/vector-icons/Ionicons';
import { isAxiosError } from 'axios';

import type { ApiResponse } from '@/interfaces/api-response';
import type { BookingStatus } from '@/interfaces/booking';
import type { ThemeColor } from '@/lib/constants';
import type { NotificationType } from '@/interfaces/notification';

type IoniconName = keyof typeof Ionicons.glyphMap;

// Backend numeric columns come back as strings (e.g. "21300.00") - format for
// display as a comma-grouped whole number, matching the design references.
export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'number' ? value : Number(value);
  return amount.toLocaleString('en-NG', { maximumFractionDigits: 0 });
}

export function formatDurationLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr${hours === 1 ? '' : 's'}`;
  return `${hours} hr${hours === 1 ? '' : 's'} ${minutes} min`;
}

// tradeType is free text in the DB (e.g. "lash-artist") - this is a
// mechanical hyphen-to-title-case formatter, not curated copy, so it won't
// always match hand-written labels like "Hair Stylist" exactly.
export function formatTradeTypeLabel(value: string): string {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getStatusColor(
  status: BookingStatus,
  theme: Record<ThemeColor, string>,
): string {
  switch (status) {
    case 'pending':
      return theme.warning;
    case 'confirmed':
      return theme.success;
    case 'cancelled':
    case 'declined':
      return theme.danger;
    case 'completed':
    default:
      return theme.textSecondary;
  }
}

const PLUM = '#4B2E46';
const SUCCESS = '#2F9E44';
const WARNING = '#E0A800';
const DANGER = '#E5484D';
const MUTED = '#817F80';

// Brand-consistent (no blue) per-type treatment for the notifications feed - icon
// choices mirror ones already meaningful elsewhere in the app (pricetag = Deals tab,
// chatbubble = Chats tab) so the same shape keeps meaning the same thing everywhere.
export function getNotificationIcon(type: NotificationType): {
  icon: IoniconName;
  color: string;
} {
  switch (type) {
    case 'booking_created':
    case 'booking_reminder':
      return { icon: 'calendar-outline', color: PLUM };
    case 'booking_confirmed':
    case 'booking_completed':
      return { icon: 'calendar-outline', color: SUCCESS };
    case 'booking_declined':
      return { icon: 'calendar-outline', color: DANGER };
    case 'booking_cancelled':
      return { icon: 'calendar-outline', color: MUTED };
    case 'offer_posted':
    case 'offer_response_received':
      return { icon: 'pricetag-outline', color: PLUM };
    case 'offer_accepted':
    case 'deal_claimed':
      return { icon: 'pricetag-outline', color: SUCCESS };
    case 'deal_posted':
      return { icon: 'pricetag-outline', color: PLUM };
    case 'payment_received':
      return { icon: 'wallet-outline', color: SUCCESS };
    case 'payment_sent':
      return { icon: 'wallet-outline', color: PLUM };
    case 'review_received':
      return { icon: 'star', color: WARNING };
    case 'message_received':
      return { icon: 'chatbubble-outline', color: PLUM };
    case 'system':
    default:
      return { icon: 'notifications-outline', color: MUTED };
  }
}

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
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Sliik is Nigeria-only (single timezone), so dates/times are treated as
// plain UTC-equivalent clock-face values throughout - matches the backend's
// own slot computation (see providers.service.ts::getAvailableSlots).
export function getNextDates(count: number): string[] {
  const today = new Date();
  const todayUtc = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );

  return Array.from({ length: count }, (_, i) => {
    const date = new Date(todayUtc + i * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(0, 10);
  });
}

export function formatDateLabel(dateStr: string): string {
  const [today, tomorrow] = getNextDates(2);
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const dayNumber = date.getUTCDate();

  if (dateStr === today) return `Today ${dayNumber}`;
  if (dateStr === tomorrow) return `Tomorrow ${dayNumber}`;

  return `${WEEKDAY_LABELS[date.getUTCDay()]} ${dayNumber}`;
}

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Structured version of formatDateLabel for the 3-line stacked date chip
// (weekday / day / month) - kept separate so deal-detail's existing
// single-line date chips aren't affected by a change scoped to this screen.
export function getDateChipParts(dateStr: string): {
  topLabel: string;
  day: number;
  month: string | null;
} {
  const [today, tomorrow] = getNextDates(2);
  const date = new Date(`${dateStr}T00:00:00.000Z`);
  const day = date.getUTCDate();

  if (dateStr === today) return { topLabel: 'Today', day, month: null };
  if (dateStr === tomorrow) return { topLabel: 'Tomorrow', day, month: null };

  return {
    topLabel: WEEKDAY_LABELS[date.getUTCDay()],
    day,
    month: MONTH_LABELS[date.getUTCMonth()],
  };
}

export function formatTimeLabel(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

// 12-hour AM/PM variant of formatTimeLabel, used where the design calls for
// it (booking time slots) - kept separate so chat/deal-detail's existing
// 24-hour display isn't affected by a change scoped to just this screen.
export function formatTime12hLabel(isoDateTime: string): string {
  const [hourStr, minuteStr] = isoDateTime.slice(11, 16).split(':');
  const hour24 = Number(hourStr);
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${String(hour12).padStart(2, '0')}:${minuteStr} ${period}`;
}

export function formatDateTimeLabel(isoDateTime: string): string {
  return `${formatDateLabel(isoDateTime.slice(0, 10))}, ${formatTimeLabel(isoDateTime)}`;
}

export function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diffMs / (60 * 1000));
  const hours = Math.floor(diffMs / (60 * 60 * 1000));
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  return new Date(dateStr).toLocaleDateString();
}

// HH:MM:SS, letting hours run past 24 rather than rolling into a day count -
// flash deals are short-lived enough that this format never needs to.
export function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(Math.floor(remainingMs / 1000), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
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

// POST /auth/login returns 403 only when the email isn't verified yet (bad
// credentials are 401), so a 403 there means "send them to the verify screen".
export function isEmailNotVerifiedError(error: unknown): boolean {
  return isAxiosError(error) && error.response?.status === 403;
}
