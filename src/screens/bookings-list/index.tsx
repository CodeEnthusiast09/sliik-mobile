import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyBookings } from '@/hooks/services/bookings';
import type { Booking } from '@/interfaces/booking';
import { formatDateTimeLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { STATUS_COLORS, styles } from './index.styles';

function otherPartyName(booking: Booking, role: string | null) {
  return role === 'customer' ? booking.provider?.fullName : booking.customer?.fullName;
}

export function BookingsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { data: bookings, isLoading, isRefetching, refetch } = useMyBookings();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Bookings
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(booking) => booking.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No bookings yet.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ pathname: '/bookings/[id]', params: { id: item.id } })}
              >
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="default">{item.service?.name ?? 'Service'}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {otherPartyName(item, role) ? `with ${otherPartyName(item, role)} · ` : ''}
                    {formatDateTimeLabel(item.scheduledAt)}
                  </ThemedText>
                  <ThemedText type="smallBold" style={{ color: STATUS_COLORS[item.status] }}>
                    {item.status}
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
