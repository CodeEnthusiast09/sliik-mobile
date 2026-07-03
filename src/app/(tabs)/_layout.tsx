import { Tabs } from 'expo-router';

import { useAuthStore } from '@/store/auth';

export default function TabsLayout() {
  const role = useAuthStore((state) => state.role);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Protected guard={role === 'customer'}>
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="account" options={{ title: 'Account' }} />
      </Tabs.Protected>

      <Tabs.Protected guard={role === 'provider'}>
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="services" options={{ title: 'Services' }} />
        <Tabs.Screen name="availability" options={{ title: 'Availability' }} />
        <Tabs.Screen name="portfolio" options={{ title: 'Portfolio' }} />
      </Tabs.Protected>
    </Tabs>
  );
}
