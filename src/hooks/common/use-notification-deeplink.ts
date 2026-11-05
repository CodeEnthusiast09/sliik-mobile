// /home/oblee/Desktop/projects/sliik-mobile/src/hooks/common/use-notification-deeplink.ts

import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import type { NotificationData } from '@/interfaces/notification';
import { isExpoGo, loadNotifications } from '@/lib/notifications-module';

function redirect(data: NotificationData | undefined): void {
  if (!data) return;
  if (data.bookingId) {
    router.push({ pathname: '/bookings/[id]', params: { id: data.bookingId } });
  } else if (data.offerId) {
    router.push({
      pathname: '/deals/offers/[id]',
      params: { id: data.offerId },
    });
  } else if (data.dealId) {
    router.push({ pathname: '/deals/[id]', params: { id: data.dealId } });
  }
}

// Handles both a tap that relaunches the app from a killed state
// (getLastNotificationResponse) and one received while already running.
// No-ops on web and in Expo Go - see `@/lib/notifications-module` for why
// we never statically import `expo-notifications`.
export function useNotificationDeeplink(): void {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (isExpoGo) return;

    const Notifications = loadNotifications();

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      redirect(lastResponse.notification.request.content.data as NotificationData);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification.request.content.data as NotificationData);
    });

    return () => subscription.remove();
  }, []);
}
