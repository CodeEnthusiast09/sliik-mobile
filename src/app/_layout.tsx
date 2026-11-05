import '@/global.css';

import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { useFonts } from 'expo-font';
import * as SystemUI from 'expo-system-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashScreen } from '@/components/animated-splash';
import { ToastHost } from '@/components/toast';
import { useNotificationDeeplink } from '@/hooks/common/use-notification-deeplink';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isLoggedIn = Boolean(accessToken && role);
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useNotificationDeeplink();

  useEffect(() => {
    const backgroundColor = pathname === '/' ? '#000000' : '#FFFFFF';
    SystemUI.setBackgroundColorAsync(backgroundColor).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (isHydrated && accessToken && !role) {
      clearAuth();
    }
  }, [accessToken, clearAuth, isHydrated, role]);

  const isReady = isHydrated && (fontsLoaded || fontError !== null);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady || !splashAnimationDone) {
    return (
      <AnimatedSplashScreen
        onAnimationEnd={() => setSplashAnimationDone(true)}
      />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={!isLoggedIn}>
              <Stack.Screen name="(auth)" />
            </Stack.Protected>
            <Stack.Protected guard={isLoggedIn}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="provider" />
              <Stack.Screen name="delete-account" />
              <Stack.Protected guard={role === 'provider'}>
                <Stack.Screen name="services" />
                <Stack.Screen name="availability" />
                <Stack.Screen name="portfolio" />
              </Stack.Protected>
            </Stack.Protected>
          </Stack>
          <ToastHost />
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
