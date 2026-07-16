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
  calculateDiscountPercent,
  formatCountdown,
  formatCurrency,
  formatShortDateLabel,
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
  return calculateDiscountPercent(
    Number(deal.originalPrice),
    Number(deal.dealPrice),
  );
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

type DealPhase = 'active' | 'scheduled' | 'ended';

const DEAL_PHASE_FILTERS: { value: DealPhase; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'ended', label: 'Ended' },
];

const DEAL_PHASE_EMPTY_MESSAGE: Record<DealPhase, string> = {
  active: 'No active deals right now. Post one to attract customers.',
  scheduled: 'No scheduled deals. Give a deal a future start date to see it here.',
  ended: 'No ended deals yet.',
};

const DEAL_PHASE_LABEL: Record<DealPhase, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  ended: 'Ended',
};

const DEAL_PHASE_COLOR: Record<DealPhase, string> = {
  active: '#2F9E44',
  scheduled: '#4B2E46',
  ended: '#817F80',
};

function getDealPhase(deal: Deal): DealPhase {
  const now = new Date();
  const startsAt = deal.startsAt ? new Date(deal.startsAt) : null;
  if (startsAt && startsAt > now) return 'scheduled';
  if (deal.slotsRemaining > 0 && new Date(deal.expiresAt) > now) return 'active';
  return 'ended';
}

function ProviderDealCard({
  deal,
  onPress,
}: {
  deal: Deal;
  onPress: () => void;
}) {
  const phase = getDealPhase(deal);
  const percent = discountPercent(deal);
  const slotsUsed = deal.slotsTotal - deal.slotsRemaining;
  const progress = deal.slotsTotal > 0 ? slotsUsed / deal.slotsTotal : 0;
  const phaseColor = DEAL_PHASE_COLOR[phase];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
    >
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-[14px] bg-[#F3F0EB]">
        {deal.service?.imageUrl ? (
          <Image
            source={{ uri: deal.service.imageUrl }}
            style={{ width: 80, height: 80 }}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="pricetag-outline" size={22} color="#A8A39B" />
        )}
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 font-serif-bold text-[16px] text-[#26242A]"
            numberOfLines={1}
          >
            {deal.title}
          </Text>
          <View
            style={{
              backgroundColor: `${phaseColor}1F`,
              borderColor: phaseColor,
              borderWidth: 1,
            }}
            className="rounded-lg px-2 py-1"
          >
            <Text
              style={{ color: phaseColor }}
              className="text-[11px] font-bold"
            >
              {DEAL_PHASE_LABEL[phase]}
            </Text>
          </View>
        </View>

        <Text className="text-[12px] text-[#817F80]" numberOfLines={1}>
          {deal.service?.name ?? 'Service'}
        </Text>

        <View className="flex-row items-center gap-2">
          <Text className="font-serif-bold text-[15px] text-[#26242A]">
            ₦{formatCurrency(deal.dealPrice)}
          </Text>
          <Text className="text-[12px] text-[#A8A39B] line-through">
            ₦{formatCurrency(deal.originalPrice)}
          </Text>
          <View className="rounded-md bg-[#4B2E461A] px-1.5 py-0.5">
            <Text className="text-[10px] font-bold text-[#4B2E46]">
              {percent}% OFF
            </Text>
          </View>
        </View>

        {phase === 'active' ? (
          <View className="mt-1 gap-1">
            <View className="h-1.5 overflow-hidden rounded-full bg-[#F3F0EB]">
              <View
                className="h-full rounded-full bg-[#4B2E46]"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>
            <Text className="text-[11px] text-[#817F80]">
              {slotsUsed} of {deal.slotsTotal} slots booked
            </Text>
          </View>
        ) : phase === 'scheduled' && deal.startsAt ? (
          <Text className="mt-1 text-[11px] text-[#817F80]">
            Starts {formatShortDateLabel(deal.startsAt)}
          </Text>
        ) : (
          <Text className="mt-1 text-[11px] text-[#817F80]">
            Ended {formatShortDateLabel(deal.expiresAt)}
          </Text>
        )}
      </View>
    </Pressable>
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
  const [phaseFilter, setPhaseFilter] = useState<DealPhase>('active');

  const filteredDeals = useMemo(
    () => (deals ?? []).filter((deal) => getDealPhase(deal) === phaseFilter),
    [deals, phaseFilter],
  );

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Sliik Deals"
            notificationsHref={notificationsHref}
            rightAction={
              <Pressable onPress={() => router.push('/deals/new')} hitSlop={10}>
                <Text className="text-[13px] font-bold text-[#4B2E46]">
                  + New deal
                </Text>
              </Pressable>
            }
          />
          <Text className="mt-1 text-[13px] text-[#817F80]">
            Create and manage special offers to grow your bookings.
          </Text>
          <DealsOffersTabs active="deals" offersLabel="Open Offers" />

          <View className="mt-4 flex-row gap-2">
            {DEAL_PHASE_FILTERS.map((filter) => (
              <Chip
                key={filter.value}
                label={filter.label}
                selected={phaseFilter === filter.value}
                onPress={() => setPhaseFilter(filter.value)}
              />
            ))}
          </View>

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
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message={DEAL_PHASE_EMPTY_MESSAGE[phaseFilter]} />
                }
                renderItem={({ item }) => (
                  <ProviderDealCard
                    deal={item}
                    onPress={() =>
                      router.push({
                        pathname: '/deals/[id]',
                        params: { id: item.id },
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
