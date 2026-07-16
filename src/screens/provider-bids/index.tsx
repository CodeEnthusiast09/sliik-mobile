import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useMyResponses } from '@/hooks/services/offers';
import type { OfferResponse, OfferResponseStatus } from '@/interfaces/offer';
import {
  formatCurrency,
  formatDateTimeLabel,
  formatShortDateLabel,
  formatTime12hLabel,
  getErrorMessage,
} from '@/lib/utils';

const STATUS_COLOR: Record<OfferResponseStatus, string> = {
  pending: '#E0A800',
  accepted: '#2F9E44',
  declined: '#E5484D',
};

type BidFilter = 'all' | OfferResponseStatus;

const BID_FILTERS: BidFilter[] = ['all', 'pending', 'accepted', 'declined'];

const FILTER_LABEL: Record<BidFilter, string> = {
  all: 'All',
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
};

const FILTER_COLOR: Record<BidFilter, string> = {
  all: '#4B2E46',
  ...STATUS_COLOR,
};

const EMPTY_MESSAGE: Record<BidFilter, string> = {
  all: 'No bids yet. Browse open offers to submit one.',
  pending: 'No pending bids.',
  accepted: 'No accepted bids yet.',
  declined: 'No declined bids.',
};

function BidFilterPill({
  filter,
  count,
  selected,
  onPress,
}: {
  filter: BidFilter;
  count: number;
  selected: boolean;
  onPress: () => void;
}) {
  const color = FILTER_COLOR[filter];

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-1.5 rounded-full px-3 py-2 ${selected ? 'bg-[#4B2E46]' : 'border border-[#DCD6C8] bg-white'
        }`}
    >
      <Text
        className={`text-[12px] font-bold ${selected ? 'text-white' : 'text-[#26242A]'}`}
      >
        {FILTER_LABEL[filter]}
      </Text>
      <View
        style={{ backgroundColor: selected ? '#FFFFFF' : `${color}1F` }}
        className="rounded-full px-1.5 py-0.5"
      >
        <Text style={{ color }} className="text-[10px] font-bold">
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function BidRow({
  response,
  onPress,
}: {
  response: OfferResponse;
  onPress: () => void;
}) {
  const statusColor = STATUS_COLOR[response.status];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
    >
      <View className="h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-2xl bg-[#F3F0EB]">
        {response.offer?.referenceImageUrl ? (
          <Image
            source={{ uri: response.offer.referenceImageUrl }}
            style={{ width: 72, height: 72 }}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="image-outline" size={20} color="#C9C1BB" />
        )}
      </View>

      <View className="flex-1 justify-center gap-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className="flex-1 font-serif-bold text-[15px] text-[#26242A]"
            numberOfLines={1}
          >
            {response.offer?.serviceType ?? 'Offer'}
          </Text>
          <Text className="font-serif-bold text-[15px] text-[#26242A]">
            ₦{formatCurrency(response.offeredPrice)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1">
          <Ionicons name="calendar-outline" size={13} color="#817F80" />
          <Text className="text-[12px] text-[#817F80]">
            {response.offer
              ? formatDateTimeLabel(response.offer.preferredFrom)
              : '—'}
          </Text>
        </View>

        {response.offer?.city ? (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color="#817F80" />
            <Text className="text-[12px] text-[#817F80]">
              {response.offer.city}
            </Text>
          </View>
        ) : null}

        <View
          style={{ backgroundColor: `${statusColor}1F` }}
          className="mt-0.5 self-start rounded-full px-2.5 py-1"
        >
          <Text
            style={{ color: statusColor }}
            className="text-[11px] font-bold"
          >
            {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
          </Text>
        </View>

        <View className="mt-0.5 flex-row items-center justify-between gap-2">
          <Text className="text-[11px] text-[#948F86]">
            You bid on {formatShortDateLabel(response.createdAt)},{' '}
            {formatTime12hLabel(response.createdAt)}
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#C9C1BB" />
        </View>
      </View>
    </Pressable>
  );
}

export function ProviderBidsScreen() {
  const router = useRouter();

  useHideTabBar();

  const {
    data: responses,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyResponses();

  const [filter, setFilter] = useState<BidFilter>('all');

  const counts = useMemo(() => {
    const list = responses ?? [];
    return {
      all: list.length,
      pending: list.filter((r) => r.status === 'pending').length,
      accepted: list.filter((r) => r.status === 'accepted').length,
      declined: list.filter((r) => r.status === 'declined').length,
    };
  }, [responses]);

  const filteredResponses = useMemo(() => {
    if (filter === 'all') return responses ?? [];
    return (responses ?? []).filter((r) => r.status === filter);
  }, [responses, filter]);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="My bids"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
            showNotifications={false}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 flex-none"
            contentContainerClassName="items-center gap-2 pr-6"
          >
            {BID_FILTERS.map((value) => (
              <BidFilterPill
                key={value}
                filter={value}
                count={counts[value]}
                selected={filter === value}
                onPress={() => setFilter(value)}
              />
            ))}
          </ScrollView>

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredResponses}
                keyExtractor={(response) => response.id}
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState
                    message={EMPTY_MESSAGE[filter]}
                    actionLabel={filter === 'all' ? 'Browse open offers' : undefined}
                    onAction={filter === 'all' ? () => router.back() : undefined}
                  />
                }
                renderItem={({ item }) => (
                  <BidRow
                    response={item}
                    onPress={() =>
                      router.push({
                        pathname: '/offers/[id]',
                        params: { id: item.offerId },
                      })
                    }
                  />
                )}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
