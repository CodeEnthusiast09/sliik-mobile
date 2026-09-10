import { useEffect } from 'react';

import { initializeNotificationHandler, registerForPushNotificationsAsync } from '@/lib/push-notifications';
import { registerPushToken } from '@/services/notifications';
import { usePushTokenStore } from '@/store/push-token';
import { useAuthStore } from '@/store/auth';

export function usePushTokenRegistration() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setToken = usePushTokenStore((state) => state.setToken);

  useEffect(() => {
    initializeNotificationHandler().catch(() => {
      // Non-critical - foreground notification presentation just won't be
      // configured; the app continues to function normally otherwise.
    });
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    registerForPushNotificationsAsync().then((result) => {
      if (cancelled || !result) return;
      setToken(result.token);
      registerPushToken(result.token, result.platform).catch(() => {
        // Non-critical - the app works fine without push, just no remote
        // delivery until the next successful registration attempt.
      });
    });

    return () => {
      cancelled = true;
    };
  }, [accessToken, setToken]);
}
