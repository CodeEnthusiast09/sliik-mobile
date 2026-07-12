import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { NotificationBell } from '@/components/notification-bell';
import { SliikWordmark } from '@/components/sliik-wordmark';

export type ScreenHeaderProps = {
  notificationsHref: Href;
  /**
   * If provided, shows a back button in the leading slot with `title` next to
   * it (drill-down screens). Without `onBack`, `title` takes over the leading
   * slot itself in place of the wordmark (tab-root screens); with neither, the
   * brand wordmark is shown (Home only).
   */
  onBack?: () => void;
  title?: string;
  /** Drill-down screens that already hide the tab bar can also drop the bell. */
  showNotifications?: boolean;
  /** Overrides the bell/spacer slot with a custom trailing element (e.g. an overflow menu button). */
  rightAction?: ReactNode;
};

export function ScreenHeader({
  notificationsHref,
  onBack,
  title,
  showNotifications = true,
  rightAction,
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
      ) : title ? (
        <Text className="font-serif-bold text-[24px] leading-[28px] text-[#26242A]">
          {title}
        </Text>
      ) : (
        <SliikWordmark height={28} />
      )}

      {onBack && title ? (
        <Text className="font-serif-bold text-[17px] text-[#26242A]">
          {title}
        </Text>
      ) : null}

      {rightAction ? (
        rightAction
      ) : showNotifications ? (
        <NotificationBell onPress={() => router.push(notificationsHref)} />
      ) : (
        <View className="h-9 w-9" />
      )}
    </View>
  );
}
