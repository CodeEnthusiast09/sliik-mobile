import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { StatusPill } from '@/components/status-pill';
import { useMyBookings } from '@/hooks/services/bookings';
import type { Booking } from '@/interfaces/booking';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function otherParty(booking: Booking, role: string | null) {
  return role === 'customer' ? booking.provider : booking.customer;
}

export function BookingsListScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const {
    data: bookings,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyBookings();

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref={notificationsHref} />

          <Text className="mt-4 font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
            Your bookings
          </Text>

          {isLoading ? (
            <View className="mt-4">
              <ListSkeleton />
            </View>
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={bookings}
              keyExtractor={(booking) => booking.id}
              contentContainerClassName="gap-3 pt-4 pb-32"
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={<EmptyState message="No bookings yet." />}
              renderItem={({ item }) => {
                const party = otherParty(item, role);
                return (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/bookings/[id]',
                        params: { id: item.id },
                      })
                    }
                    className="flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                  >
                    <Avatar
                      uri={party?.avatarUrl}
                      name={party?.fullName ?? '?'}
                      size={56}
                    />

                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="font-serif-bold text-[16px] text-[#26242A]">
                          {item.service?.name ?? 'Service'}
                        </Text>
                        <StatusPill status={item.status} />
                      </View>
                      {party?.fullName ? (
                        <Text className="text-[13px] text-[#817F80]">
                          {party.fullName}
                        </Text>
                      ) : null}
                      <Text className="text-[13px] text-[#817F80]">
                        {formatDateTimeLabel(item.scheduledAt)} • ₦
                        {item.totalAmount}
                      </Text>
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
