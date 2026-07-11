import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { NotificationBell } from '@/components/notification-bell';
import { SliikWordmark } from '@/components/sliik-wordmark';

export type ScreenHeaderProps = {
  notificationsHref: Href;
  /**
   * If provided, shows a back button in the leading slot (and `title` next to
   * it) instead of the brand wordmark. Tab-root screens omit this and get the
   * wordmark with no title.
   */
  onBack?: () => void;
  title?: string;
  /** Drill-down screens that already hide the tab bar can also drop the bell. */
  showNotifications?: boolean;
};

export function ScreenHeader({
  notificationsHref,
  onBack,
  title,
  showNotifications = true,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between py-2">
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={28} color="#4B2E46" />
        </Pressable>
      ) : (
        <SliikWordmark height={28} />
      )}

      {title ? (
        <Text className="font-serif-bold text-[17px] text-[#26242A]">
          {title}
        </Text>
      ) : null}

      {showNotifications ? (
        <NotificationBell onPress={() => router.push(notificationsHref)} />
      ) : (
        <View className="h-9 w-9" />
      )}
    </View>
  );
}
