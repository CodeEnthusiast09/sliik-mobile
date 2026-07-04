import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import type { NotificationData } from '@/interfaces/notification';

function redirect(data: NotificationData | undefined) {
  if (!data) return;
  if (data.bookingId) {
    router.push({ pathname: '/bookings/[id]', params: { id: data.bookingId } });
  } else if (data.offerId) {
    router.push({ pathname: '/offers/[id]', params: { id: data.offerId } });
  } else if (data.dealId) {
    router.push({ pathname: '/deals/[id]', params: { id: data.dealId } });
  }
}

// Handles both a tap that relaunches the app from a killed state
// (getLastNotificationResponse) and one received while already running.
export function useNotificationDeeplink() {
  useEffect(() => {
    // getLastNotificationResponse/addNotificationResponseReceivedListener
    // are native-only - the former throws outright on web rather than
    // no-op'ing, so this whole hook is skipped there.
    if (Platform.OS === 'web') return;

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
