import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { StatusPill } from '@/components/status-pill';
import { useMyBookings } from '@/hooks/services/bookings';
import type { Booking } from '@/interfaces/booking';
import { formatBookingDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

const FILTER_TABS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

type FilterValue = (typeof FILTER_TABS)[number]['value'];

function otherParty(booking: Booking, role: string | null) {
  return role === 'customer' ? booking.provider : booking.customer;
}

function matchesFilter(booking: Booking, filter: FilterValue) {
  if (filter === 'all') return true;
  if (filter === 'cancelled') {
    return booking.status === 'cancelled' || booking.status === 'declined';
  }
  return booking.status === filter;
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

  const [filter, setFilter] = useState<FilterValue>('all');

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  const filteredBookings = bookings?.filter((booking) =>
    matchesFilter(booking, filter),
  );

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader title="My bookings" notificationsHref={notificationsHref} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 flex-none"
            contentContainerClassName="items-center gap-2 pr-6"
          >
            {FILTER_TABS.map((tab) => (
              <Chip
                key={tab.value}
                label={tab.label}
                selected={filter === tab.value}
                onPress={() => setFilter(tab.value)}
              />
            ))}
          </ScrollView>

          {isLoading ? (
            <View className="mt-4">
              <ListSkeleton />
            </View>
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={filteredBookings}
              keyExtractor={(booking) => booking.id}
              contentContainerClassName="grow gap-3 pt-4 pb-32"
              refreshing={isRefetching}
              onRefresh={refetch}
              ListEmptyComponent={<EmptyState message="No bookings yet." />}
              ListFooterComponent={
                filteredBookings?.length ? (
                  <Text className="mt-2 text-center text-[12px] text-[#A8A39B]">
                    Can&apos;t find a booking? Pull down to refresh.
                  </Text>
                ) : null
              }
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
                    className="flex-row gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                  >
                    <View className="w-20 min-h-[104px] self-stretch overflow-hidden rounded-2xl bg-[#E7E1D9]">
                      {party?.avatarUrl ? (
                        <Image
                          source={{ uri: party.avatarUrl }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Text className="text-[28px] font-bold text-[#4B2E46]">
                            {(party?.fullName ?? '?').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-1 gap-1">
                      <View className="mt-1 flex items-start justify-between gap-2">
                        <Text
                          className="flex-1 font-serif-bold text-[14px] text-[#26242A]"
                          numberOfLines={1}
                        >
                          {item.service?.name ?? 'Service'}
                        </Text>

                        <View className='w-full flex-row items-center justify-between'>
                          {party?.fullName ? (
                            <Text className="text-[13px] text-[#817F80]">
                              with {party.fullName}
                            </Text>
                          ) : null}

                          <StatusPill status={item.status} />
                        </View>
                      </View>

                      <View className="flex-row items-center gap-1 mb-1">
                        <Ionicons
                          name="calendar-outline"
                          size={13}
                          color="#817F80"
                        />
                        <Text className="text-[13px] text-[#817F80]">
                          {formatBookingDateTimeLabel(item.scheduledAt)}
                        </Text>
                      </View>

                      {party?.city ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons
                            name="location-outline"
                            size={13}
                            color="#817F80"
                          />
                          <Text className="text-[13px] text-[#817F80]">
                            {party.city}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </SafeAreaView >
    </View >
  );
}
