import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { type ColorValue, View } from 'react-native';

import { useNotificationsSocket } from '@/hooks/common/use-notifications-socket';
import { usePushTokenRegistration } from '@/hooks/common/use-push-token-registration';
import { useChatUnreadCount } from '@/hooks/services/chat';
import { TAB_BAR_STYLE } from '@/lib/constants';
import { useAuthStore } from '@/store/auth';

type IoniconName = keyof typeof Ionicons.glyphMap;
type TabIconProps = { focused: boolean; color: ColorValue; size: number };

function tabIcon(outline: IoniconName, filled: IoniconName) {
  function TabIcon({ focused, color, size }: TabIconProps) {
    const iconSize = Math.min(size, 20);

    return (
      <Ionicons
        name={focused ? filled : outline}
        color={color as string}
        size={iconSize}
      />
    );
  }
  return TabIcon;
}

function HomeTabIcon({ focused, color, size }: TabIconProps) {
  const iconSize = Math.min(size, 20);

  return (
    <Ionicons
      name={focused ? 'home' : 'home-outline'}
      color={color as string}
      size={iconSize}
    />
  );
}

function ChatsTabIcon({ focused, color, size }: TabIconProps) {
  const { data: unreadCount } = useChatUnreadCount();
  const iconSize = Math.min(size, 20);

  return (
    <View style={{ width: iconSize, height: iconSize }}>
      <Ionicons
        name={focused ? 'chatbubble' : 'chatbubble-outline'}
        color={color as string}
        size={iconSize}
      />
      {unreadCount ? (
        <View
          style={{ position: 'absolute', top: -2, right: -2 }}
          className="h-2.5 w-2.5 rounded-full border border-white bg-[#4B2E46]"
        />
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const role = useAuthStore((state) => state.role);

  usePushTokenRegistration();
  useNotificationsSocket();

  return (
    <Tabs
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4B2E46',
        tabBarInactiveTintColor: '#948F86',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '400' },
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
        <Tabs.Screen
          name="chats"
          options={{
            title: 'Chats',
            tabBarIcon: ChatsTabIcon,
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

    </Tabs>
  );
}
