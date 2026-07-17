import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { DealsOffersTabs } from '@/components/deals-offers-tabs';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useActiveDeals } from '@/hooks/services/deals';
import { formatTradeTypeLabel, getErrorMessage } from '@/lib/utils';

import { DealCardBase } from './deal-card-base';

type PriceBucket = { label: string; min: number; max?: number };

// No discount-range option - a deal's % off already shows on the card, and
// combining it with price would double up on the same signal for little gain.
const PRICE_BUCKETS: PriceBucket[] = [
  { label: 'Under ₦5,000', min: 0, max: 5000 },
  { label: '₦5,000 - ₦15,000', min: 5000, max: 15000 },
  { label: '₦15,000 - ₦30,000', min: 15000, max: 30000 },
  { label: '₦30,000+', min: 30000 },
];

export function CustomerDealsFeed({
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
