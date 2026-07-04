import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMarkAllAsRead, useMarkAsRead, useNotifications } from '@/hooks/services/notifications';
import type { AppNotification } from '@/interfaces/notification';
import { formatDateTimeLabel } from '@/lib/utils';

import { styles } from './index.styles';

function targetRoute(notification: AppNotification) {
  const data = notification.data;
  if (data?.bookingId) {
    return { pathname: '/bookings/[id]' as const, params: { id: data.bookingId } };
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
  const { data: notifications, isLoading, refetch, isRefetching } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  function handlePress(notification: AppNotification) {
    if (!notification.readAt) markAsReadMutation.mutate(notification.id);

    const route = targetRoute(notification);
    if (route) router.push(route);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedView style={styles.headerRow}>
          <ThemedText type="title" style={styles.title}>
            Notifications
          </ThemedText>
          <Pressable onPress={() => markAllAsReadMutation.mutate()}>
            <ThemedText type="linkPrimary">Mark all read</ThemedText>
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No notifications yet.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => handlePress(item)}>
                <ThemedView
                  type={item.readAt ? 'backgroundElement' : 'backgroundSelected'}
                  style={styles.card}
                >
                  <ThemedText type="smallBold">{item.title}</ThemedText>
                  <ThemedText type="default">{item.body}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {formatDateTimeLabel(item.createdAt)}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
