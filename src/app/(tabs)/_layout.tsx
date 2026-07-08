import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { type ColorValue } from 'react-native';

import { useNotificationsSocket } from '@/hooks/common/use-notifications-socket';
import { usePushTokenRegistration } from '@/hooks/common/use-push-token-registration';
import { TAB_BAR_STYLE } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';

type IoniconName = keyof typeof Ionicons.glyphMap;
type TabIconProps = { focused: boolean; color: ColorValue; size: number };

function tabIcon(outline: IoniconName, filled: IoniconName) {
  function TabIcon({ focused, color, size }: TabIconProps) {
    return (
      <Ionicons
        name={focused ? filled : outline}
        color={color as string}
        size={size}
      />
    );
  }
  return TabIcon;
}

function HomeTabIcon({ focused, color, size }: TabIconProps) {
  return (
    <MaterialCommunityIcons
      name={focused ? 'home-variant' : 'home-variant-outline'}
      color={color as string}
      size={size}
    />
  );
}

export default function TabsLayout() {
  const role = useAuthStore((state) => state.role);

  usePushTokenRegistration();
  useNotificationsSocket();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4B2E46',
        tabBarInactiveTintColor: '#948F86',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: TAB_BAR_STYLE,
      }}
    >
      <Tabs.Protected guard={role === 'customer'}>
        <Tabs.Screen
          name="home"
          options={{ title: 'Home', tabBarIcon: HomeTabIcon }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={role === 'provider'}>
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: tabIcon('person-outline', 'person'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={role === 'customer' || role === 'provider'}>
        <Tabs.Screen
          name="bookings"
          options={{
            title: 'Bookings',
            tabBarIcon: tabIcon('calendar-outline', 'calendar'),
          }}
        />
        <Tabs.Screen
          name="deals"
          options={{
            title: 'Deals',
            tabBarIcon: tabIcon('pricetag-outline', 'pricetag'),
          }}
        />
        {/* Merged into the Deals tab (segmented toggle) - kept as a real, navigable
         * route so links to it still work, just not its own tab button. */}
        <Tabs.Screen name="offers" options={{ href: null }} />
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Chats',
            tabBarIcon: tabIcon('chatbubble-outline', 'chatbubble'),
          }}
        />
      </Tabs.Protected>

      <Tabs.Protected guard={role === 'customer'}>
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: tabIcon('person-outline', 'person'),
          }}
        />
      </Tabs.Protected>

      {/* Reachable from Profile as linked sub-pages, not their own tab buttons. */}
      <Tabs.Protected guard={role === 'provider'}>
        <Tabs.Screen name="services" options={{ href: null }} />
        <Tabs.Screen name="availability" options={{ href: null }} />
        <Tabs.Screen name="portfolio" options={{ href: null }} />
      </Tabs.Protected>
    </Tabs>
  );
}
