import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { DealsOffersTabs } from '@/components/deals-offers-tabs';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useCountdown } from '@/hooks/common/use-countdown';
import { useActiveDeals, useMyDeals } from '@/hooks/services/deals';
import type { Deal } from '@/interfaces/deal';
import {
  formatCountdown,
  formatCurrency,
  formatTradeTypeLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

type PriceBucket = { label: string; min: number; max?: number };

// No discount-range option - a deal's % off already shows on the card, and
// combining it with price would double up on the same signal for little gain.
const PRICE_BUCKETS: PriceBucket[] = [
  { label: 'Under ₦5,000', min: 0, max: 5000 },
  { label: '₦5,000 - ₦15,000', min: 5000, max: 15000 },
  { label: '₦15,000 - ₦30,000', min: 15000, max: 30000 },
  { label: '₦30,000+', min: 30000 },
];

function discountPercent(deal: Deal) {
  const original = Number(deal.originalPrice);
  const dealPrice = Number(deal.dealPrice);
  if (!original) return 0;
  return Math.round((1 - dealPrice / original) * 100);
}

function DealCardBase({
  deal,
  onPress,
  topRight,
  subtitle,
}: {
  deal: Deal;
  onPress: () => void;
  topRight: ReactNode;
  subtitle: string;
}) {
  const photoUrl = deal.provider?.portfolio?.[0]?.imageUrl;
  const remainingMs = useCountdown(deal.expiresAt);
  const isLive = deal.slotsRemaining > 0 && remainingMs > 0;

  return (
    <Pressable
      onPress={onPress}
      className="h-52 overflow-hidden rounded-[20px] bg-[#2A2226]"
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="absolute left-3 top-3 rounded-full bg-[#4B2E46] px-2.5 py-1">
        <Text className="text-[11px] font-bold text-white">
          {discountPercent(deal)}% OFF
        </Text>
      </View>
      <View className="absolute right-3 top-3">{topRight}</View>

      <View className="absolute bottom-0 left-0 right-0 gap-1 p-4">
        <Text
          className="font-serif-bold text-[18px] leading-[22px] text-white"
          numberOfLines={2}
        >
          {deal.title}
        </Text>
        <Text className="text-[13px] text-[#E7E1DC]">{subtitle}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="font-serif-bold text-[18px] text-white">
            ₦{formatCurrency(deal.dealPrice)}
          </Text>
          <Text className="text-[13px] text-[#C9C1BB] line-through">
            ₦{formatCurrency(deal.originalPrice)}
          </Text>
        </View>
      </View>

      {isLive ? (
        <View className="absolute bottom-3 right-3 flex-row items-center gap-1 rounded-full bg-black/55 px-2.5 py-1">
          <Ionicons name="time-outline" size={11} color="white" />
          <Text className="text-[11px] font-bold text-white">
            Ends in {formatCountdown(remainingMs)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function DealsListScreen() {
  const role = useAuthStore((state) => state.role);
  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  return role === 'provider' ? (
    <ProviderDealsList notificationsHref={notificationsHref} />
  ) : (
    <CustomerDealsFeed notificationsHref={notificationsHref} />
  );
}

function CustomerDealsFeed({
  notificationsHref,
}: {
  notificationsHref: '/home/notifications' | '/profile/notifications';
}) {
  const router = useRouter();
  const {
    data: deals,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useActiveDeals();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );
  const [selectedPriceBucket, setSelectedPriceBucket] =
    useState<PriceBucket | null>(null);

  const categoryOptions = useMemo(() => {
    const options = new Set<string>();
    for (const deal of deals ?? []) {
      if (deal.provider?.tradeType) options.add(deal.provider.tradeType);
    }
    return Array.from(options).sort();
  }, [deals]);

  const filteredDeals = useMemo(() => {
    return (deals ?? []).filter((deal) => {
      if (selectedCategory && deal.provider?.tradeType !== selectedCategory) {
        return false;
      }
      if (selectedPriceBucket) {
        const price = Number(deal.dealPrice);
        if (price < selectedPriceBucket.min) return false;
        if (selectedPriceBucket.max != null && price >= selectedPriceBucket.max) {
          return false;
        }
      }
      return true;
    });
  }, [deals, selectedCategory, selectedPriceBucket]);

  const hasActiveFilter = !!selectedCategory || !!selectedPriceBucket;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Flash deals"
            notificationsHref={notificationsHref}
            showNotifications={false}
            rightAction={
              <Pressable
                onPress={() => setFilterModalVisible(true)}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons
                  name="funnel-outline"
                  size={22}
                  color={hasActiveFilter ? '#4B2E46' : '#26242A'}
                />
                {hasActiveFilter ? (
                  <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#4B2E46]" />
                ) : null}
              </Pressable>
            }
          />
          <DealsOffersTabs active="deals" />

          {hasActiveFilter ? (
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              {selectedCategory ? (
                <Pressable
                  onPress={() => setSelectedCategory(null)}
                  className="flex-row items-center gap-1.5 rounded-full border border-[#4B2E46] bg-[#4B2E4620] px-3 py-1.5"
                >
                  <Text className="text-[12px] font-bold text-[#4B2E46]">
                    {formatTradeTypeLabel(selectedCategory)}
                  </Text>
                  <Ionicons name="close" size={13} color="#4B2E46" />
                </Pressable>
              ) : null}
              {selectedPriceBucket ? (
                <Pressable
                  onPress={() => setSelectedPriceBucket(null)}
                  className="flex-row items-center gap-1.5 rounded-full border border-[#4B2E46] bg-[#4B2E4620] px-3 py-1.5"
                >
                  <Text className="text-[12px] font-bold text-[#4B2E46]">
                    {selectedPriceBucket.label}
                  </Text>
                  <Ionicons name="close" size={13} color="#4B2E46" />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={filteredDeals}
                keyExtractor={(deal) => deal.id}
                contentContainerClassName="grow gap-4 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState
                    message={
                      hasActiveFilter
                        ? 'No deals match these filters.'
                        : 'No active deals right now. Check back soon.'
                    }
                  />
                }
                renderItem={({ item }) => (
                  <DealCardBase
                    deal={item}
                    subtitle={`by ${item.provider?.fullName ?? 'Provider'}`}
                    onPress={() =>
                      router.push({
                        pathname: '/deals/[id]',
                        params: { id: item.id },
                      })
                    }
                    topRight={
                      <View className="rounded-full bg-black/55 px-2.5 py-1">
                        <Text className="text-[11px] font-bold text-white">
                          {item.slotsRemaining} left
                        </Text>
                      </View>
                    }
                  />
                )}
              />
            )}
          </View>
        </View>

        <Modal
          visible={filterModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFilterModalVisible(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setFilterModalVisible(false)}
          >
            <Pressable
              className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
              onPress={(event) => event.stopPropagation()}
            >
              <Text className="mb-4 text-center text-base font-bold text-[#26242A]">
                Filter deals
              </Text>

              <Text className="mb-2 text-[13px] font-bold text-[#817F80]">
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categoryOptions.length === 0 ? (
                  <Text className="text-[13px] text-[#817F80]">
                    No categories available yet.
                  </Text>
                ) : (
                  categoryOptions.map((tradeType) => (
                    <Chip
                      key={tradeType}
                      label={formatTradeTypeLabel(tradeType)}
                      selected={selectedCategory === tradeType}
                      onPress={() =>
                        setSelectedCategory(
                          selectedCategory === tradeType ? null : tradeType,
                        )
                      }
                    />
                  ))
                )}
              </View>

              <Text className="mb-2 mt-5 text-[13px] font-bold text-[#817F80]">
                Price
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {PRICE_BUCKETS.map((bucket) => (
                  <Chip
                    key={bucket.label}
                    label={bucket.label}
                    selected={selectedPriceBucket?.label === bucket.label}
                    onPress={() =>
                      setSelectedPriceBucket(
                        selectedPriceBucket?.label === bucket.label
                          ? null
                          : bucket,
                      )
                    }
                  />
                ))}
              </View>

              <View className="mt-6">
                <Button
                  label="Show results"
                  onPress={() => setFilterModalVisible(false)}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function ProviderDealsList({
  notificationsHref,
}: {
  notificationsHref: '/home/notifications' | '/profile/notifications';
}) {
  const router = useRouter();
  const {
    data: deals,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyDeals();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader title="Posted deals" notificationsHref={notificationsHref} />
          <DealsOffersTabs active="deals" />

          <View className="mt-4 flex-row items-center justify-end">
            <Pressable
              onPress={() => router.push('/deals/new')}
              className="rounded-full bg-[#4B2E46] px-4 py-2.5"
            >
              <Text className="text-[13px] font-bold text-white">
                + New deal
              </Text>
            </Pressable>
          </View>

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={deals}
                keyExtractor={(deal) => deal.id}
                contentContainerClassName="grow gap-4 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message="No deals yet. Post one to attract customers with a flash discount." />
                }
                renderItem={({ item }) => {
                  const isLive =
                    item.slotsRemaining > 0 &&
                    new Date(item.expiresAt) > new Date();
                  return (
                    <DealCardBase
                      deal={item}
                      subtitle={`${item.service?.name ?? 'Service'} · ${item.slotsRemaining} of ${item.slotsTotal} slots left`}
                      onPress={() =>
                        router.push({
                          pathname: '/deals/[id]',
                          params: { id: item.id },
                        })
                      }
                      topRight={
                        <View
                          className={`rounded-full px-2.5 py-1 ${isLive ? 'bg-[#E0A800]' : 'bg-black/55'}`}
                        >
                          <Text className="text-[11px] font-bold text-white">
                            {isLive ? 'Live' : 'Ended'}
                          </Text>
                        </View>
                      }
                    />
                  );
                }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
