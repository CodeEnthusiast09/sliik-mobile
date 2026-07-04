import { useEffect } from 'react';

import { registerForPushNotificationsAsync } from '@/lib/push-notifications';
import { registerPushToken } from '@/services/notifications';
import { usePushTokenStore } from '@/store/push-token';
import { useAuthStore } from '@/store/auth';

export function usePushTokenRegistration() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setToken = usePushTokenStore((state) => state.setToken);

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
