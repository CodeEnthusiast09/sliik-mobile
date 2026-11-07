import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/hooks/services/notifications';
import type { AppNotification } from '@/interfaces/notification';
import {
  formatDateTimeLabel,
  getErrorMessage,
  getNotificationIcon,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

type NotificationSection = {
  title: string;
  data: AppNotification[];
};

function getUtcDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getNotificationGroup(createdAt: string): string {
  const now = new Date();
  const dateKey = createdAt.slice(0, 10);
  const todayKey = getUtcDateKey(now);
  const yesterdayKey = getUtcDateKey(
    new Date(now.getTime() - 24 * 60 * 60 * 1000),
  );

  if (dateKey === todayKey) return 'Today';
  if (dateKey === yesterdayKey) return 'Yesterday';
  return 'Earlier';
}

function targetRoute(notification: AppNotification) {
  const data = notification.data;
  if (notification.type === 'message_received' && data?.bookingId) {
    return {
      pathname: '/chats/[id]' as const,
      params: { id: data.bookingId },
    };
  }
  if (data?.bookingId) {
    return {
      pathname: '/bookings/[id]' as const,
      params: { id: data.bookingId },
    };
  }
  if (data?.offerId) {
    return {
      pathname: '/deals/offers/[id]' as const,
      params: { id: data.offerId },
    };
  }
  if (data?.dealId) {
    return { pathname: '/deals/[id]' as const, params: { id: data.dealId } };
  }
  return null;
}

export function NotificationsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);

  useHideTabBar();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notifications = useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  );

  const sections = useMemo<NotificationSection[]>(() => {
    const grouped = new Map<string, AppNotification[]>();

    for (const notification of notifications) {
      const group = getNotificationGroup(notification.createdAt);
      const existing = grouped.get(group);
      if (existing) {
        existing.push(notification);
      } else {
        grouped.set(group, [notification]);
      }
    }

    return ['Today', 'Yesterday', 'Earlier'].flatMap((title) => {
      const group = grouped.get(title);
      return group ? [{ title, data: group }] : [];
    });
  }, [notifications]);

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  function handlePress(notification: AppNotification) {
    if (!notification.readAt) markAsReadMutation.mutate(notification.id);

    const route = targetRoute(notification);
    if (route) router.push(route);
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Notifications"
            notificationsHref={notificationsHref}
            onBack={() => router.back()}
            showNotifications={false}
          />

          <View className="mt-4">
            <Pressable onPress={() => markAllAsReadMutation.mutate()}>
              <Text className="text-[14px] text-right font-bold text-[#4B2E46]">
                Mark all read
              </Text>
            </Pressable>
          </View>

          {isLoading ? (
            <View className="mt-4">
              <ListSkeleton />
            </View>
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <SectionList
              showsVerticalScrollIndicator={false}
              sections={sections}
              keyExtractor={(item) => item.id}
              contentContainerClassName="grow pt-4 pb-32"
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={refetch}
              onEndReached={() => {
                if (hasNextPage && !isFetchingNextPage) fetchNextPage();
              }}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={
                <EmptyState message="No notifications yet." />
              }
              ListFooterComponent={
                isFetchingNextPage ? (
                  <ActivityIndicator className="py-4" color="#4B2E46" />
                ) : undefined
              }
              renderSectionHeader={({ section }) => (
                <Text className="mb-3 mt-1 font-serif-bold text-[17px] text-[#26242A]">
                  {section.title}
                </Text>
              )}
              renderItem={({ item }) => {
                const { icon, color } = getNotificationIcon(item.type);
                return (
                  <Pressable className="mb-3" onPress={() => handlePress(item)}>
                    <View
                      style={
                        item.readAt ? undefined : { backgroundColor: '#4B2E461F' }
                      }
                      className={`flex-row items-start gap-3 rounded-[20px] p-4 ${item.readAt ? 'border border-[#ECE7E0] bg-white' : ''
                        }`}
                    >
                      <View
                        style={{ backgroundColor: `${color}1F` }}
                        className="h-10 w-10 items-center justify-center rounded-full"
                      >
                        <Ionicons name={icon} size={20} color={color} />
                      </View>

                      <View className="flex-1 gap-1">
                        <Text className="font-serif-bold text-[15px] text-[#26242A]">
                          {item.title}
                        </Text>
                        <Text className="text-[14px] text-[#26242A]">
                          {item.body}
                        </Text>
                      </View>

                      <View className="relative w-[88px] self-stretch items-end">
                        <Text className="text-right text-[12px] text-[#817F80]">
                          {formatDateTimeLabel(item.createdAt)}
                        </Text>
                        <View className="absolute bottom-0 left-0 right-0 top-0 items-end justify-center">
                          {item.readAt ? null : (
                            <View className="h-2 w-2 rounded-full bg-[#4B2E46]" />
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
