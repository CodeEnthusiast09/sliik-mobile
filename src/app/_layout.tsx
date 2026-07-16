import '@/global.css';

import { Fraunces_400Regular } from '@expo-google-fonts/fraunces/400Regular';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AnimatedSplashScreen } from '@/components/animated-splash';
import { ToastHost } from '@/components/toast';
import { useNotificationDeeplink } from '@/hooks/common/use-notification-deeplink';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/store/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoggedIn = useAuthStore((state) => !!state.accessToken);
  const [fontsLoaded] = useFonts({
    Fraunces_400Regular,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useNotificationDeeplink();

  const isReady = isHydrated && fontsLoaded;

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
          </Stack.Protected>
        </Stack>
        <ToastHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
