import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Chip } from '@/components/chip';
import { DealsOffersTabs } from '@/components/deals-offers-tabs';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useMyDeals } from '@/hooks/services/deals';
import { getErrorMessage } from '@/lib/utils';

import {
  ProviderDealCard,
  getDealPhase,
  type DealPhase,
} from './provider-deal-card';

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

export function ProviderDealsList({
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
