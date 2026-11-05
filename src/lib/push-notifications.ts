
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { isExpoGo, loadNotifications } from '@/lib/notifications-module';

export interface PushRegistrationResult {
  token: string;
  platform: 'ios' | 'android';
}

/**
 * Configures how notifications are presented while the app is in the
 * foreground. Safe in a development build and on native platforms; no-ops
 * in Expo Go and on web, where this either isn't supported or isn't needed.
 * Call once during app startup.
 */
export async function initializeNotificationHandler(): Promise<void> {
  if (isExpoGo) return;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return;

  const Notifications = loadNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Registers the device for remote push notifications and returns an Expo
 * push token. Requires a linked EAS project (`extra.eas.projectId`) and a
 * development build - resolves to `null` in Expo Go, on web, when
 * permission is denied, or when no EAS project is configured, rather than
 * throwing.
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult | null> {
  if (isExpoGo) return null;
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;

  try {
    const Notifications = loadNotifications();

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return null;

    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token: data, platform: Platform.OS };
  } catch {
    return null;
  }
}
