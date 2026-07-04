import { useRouter } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/common/use-theme';
import { useMyBookings } from '@/hooks/services/bookings';
import type { Booking } from '@/interfaces/booking';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { getStatusColor, styles } from './index.styles';

function otherPartyName(booking: Booking, role: string | null) {
  return role === 'customer' ? booking.provider?.fullName : booking.customer?.fullName;
}

export function BookingsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const theme = useTheme();
  const { data: bookings, isLoading, isError, error, isRefetching, refetch } = useMyBookings();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Bookings
        </ThemedText>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(booking) => booking.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message="No bookings yet." />}
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
                  <ThemedText type="smallBold" style={{ color: getStatusColor(item.status, theme) }}>
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
