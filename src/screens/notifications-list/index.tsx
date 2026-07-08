import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useNotifications,
} from '@/hooks/services/notifications';
import type { AppNotification } from '@/interfaces/notification';
import { formatDateTimeLabel, getErrorMessage, getNotificationIcon } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function targetRoute(notification: AppNotification) {
  const data = notification.data;
  if (data?.bookingId) {
    return {
      pathname: '/bookings/[id]' as const,
      params: { id: data.bookingId },
    };
  }
  if (data?.offerId) {
    return { pathname: '/offers/[id]' as const, params: { id: data.offerId } };
  }
  if (data?.dealId) {
    return { pathname: '/deals/[id]' as const, params: { id: data.dealId } };
  }
  return null;
}

export function NotificationsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const {
    data: notifications,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  function handlePress(notification: AppNotification) {
    if (!notification.readAt) markAsReadMutation.mutate(notification.id);

    const route = targetRoute(notification);
    if (route) router.push(route);
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Notifications"
            notificationsHref={notificationsHref}
            onBack={() => router.back()}
          />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-serif-bold text-[28px] leading-[32px] text-[#26242A]">
              Notifications
            </Text>
            <Pressable onPress={() => markAllAsReadMutation.mutate()}>
              <Text className="text-[14px] font-bold text-[#4B2E46]">
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
            <FlatList
              showsVerticalScrollIndicator={false}
              data={notifications}
              keyExtractor={(item) => item.id}
              contentContainerClassName="gap-3 pt-4 pb-32"
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={
                <EmptyState message="No notifications yet." />
              }
              renderItem={({ item }) => {
                const { icon, color } = getNotificationIcon(item.type);
                return (
                  <Pressable onPress={() => handlePress(item)}>
                    <View
                      style={
                        item.readAt ? undefined : { backgroundColor: '#4B2E461F' }
                      }
                      className={`flex-row items-start gap-3 rounded-[20px] p-4 ${
                        item.readAt ? 'border border-[#ECE7E0] bg-white' : ''
                      }`}
                    >
                      <View
                        style={{ backgroundColor: `${color}1F` }}
                        className="h-10 w-10 items-center justify-center rounded-full"
                      >
                        <Ionicons name={icon} size={20} color={color} />
                      </View>

                      <View className="flex-1 gap-1">
                        <View className="flex-row items-start justify-between gap-2">
                          <Text className="flex-1 font-serif-bold text-[15px] text-[#26242A]">
                            {item.title}
                          </Text>
                          <Text className="text-[12px] text-[#817F80]">
                            {formatDateTimeLabel(item.createdAt)}
                          </Text>
                        </View>
                        <Text className="text-[14px] text-[#26242A]">
                          {item.body}
                        </Text>
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
