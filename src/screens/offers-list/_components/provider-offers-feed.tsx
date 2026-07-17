import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
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
import { useOpenOffers } from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import type { Offer } from '@/interfaces/offer';
import {
  formatCurrency,
  formatDateTimeLabel,
  formatShortDateLabel,
  getErrorMessage,
} from '@/lib/utils';

type SortOption = 'newest' | 'highest' | 'lowest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'highest', label: 'Highest budget' },
  { value: 'lowest', label: 'Lowest budget' },
];

function budgetLabel(offer: Offer) {
  return offer.budget
    ? `Budget ₦${formatCurrency(offer.budget)}`
    : 'Open to offers';
}

function bidsSoFarLabel(offer: Offer) {
  const count = offer.responses?.length ?? 0;
  return `${count} bid${count === 1 ? '' : 's'} so far`;
}

export function ProviderOffersFeed({
  notificationsHref,
}: {
  notificationsHref: '/home/notifications' | '/profile/notifications';
}) {
  const router = useRouter();
  const {
    data: provider,
    isLoading: isLoadingProvider,
    isError: isProviderError,
    error: providerError,
    refetch: refetchProvider,
  } = useProviderProfile();
  const {
    data: offers,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useOpenOffers();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null,
  );
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  const categoryOptions = useMemo(() => {
    const options = new Set<string>();
    for (const offer of offers ?? []) options.add(offer.serviceType);
    return Array.from(options).sort();
  }, [offers]);

  const visibleOffers = useMemo(() => {
    const filtered = (offers ?? []).filter(
      (offer) => !selectedCategory || offer.serviceType === selectedCategory,
    );
    const sorted = [...filtered];
    if (sortOption === 'highest') {
      sorted.sort((a, b) => Number(b.budget ?? 0) - Number(a.budget ?? 0));
    } else if (sortOption === 'lowest') {
      sorted.sort((a, b) => Number(a.budget ?? 0) - Number(b.budget ?? 0));
    } else {
      sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return sorted;
  }, [offers, selectedCategory, sortOption]);

  const hasActiveFilter = !!selectedCategory || sortOption !== 'newest';

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Open Offers"
            notificationsHref={notificationsHref}
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
          <DealsOffersTabs active="offers" offersLabel="Open Offers" />

          <View className="mt-4 flex-row items-center justify-end">
            <Pressable
              onPress={() => router.push('/offers/my-bids')}
              className="flex-row items-center gap-1.5 rounded-full border bg-[#4B2E46] px-4 py-2.5"
            >
              <Ionicons name="receipt-outline" size={15} color="white" />
              <Text className="text-[13px] font-bold text-white">
                My bids
              </Text>
            </Pressable>
          </View>

          {selectedCategory ? (
            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              <Pressable
                onPress={() => setSelectedCategory(null)}
                className="flex-row items-center gap-1.5 rounded-full border border-[#4B2E46] bg-[#4B2E4620] px-3 py-1.5"
              >
                <Text className="text-[12px] font-bold capitalize text-[#4B2E46]">
                  {selectedCategory}
                </Text>
                <Ionicons name="close" size={13} color="#4B2E46" />
              </Pressable>
            </View>
          ) : null}

          <View className="mt-4 flex-1">
            {isProviderError ? (
              <ErrorState
                message={getErrorMessage(providerError)}
                onRetry={refetchProvider}
              />
            ) : isLoadingProvider ? (
              <ListSkeleton />
            ) : !provider?.city ? (
              <View className="rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                <Text className="text-[14px] text-[#817F80]">
                  Set your city in your profile to see open offers near you.
                </Text>
              </View>
            ) : isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={visibleOffers}
                keyExtractor={(offer) => offer.id}
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState
                    message={
                      hasActiveFilter
                        ? 'No open offers match these filters.'
                        : `No open offers in ${provider.city} right now.`
                    }
                  />
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/offers/[id]',
                        params: { id: item.id },
                      })
                    }
                    className="flex-row gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                  >
                    <View className="h-[104px] w-[72px] overflow-hidden rounded-2xl bg-[#F3F0EB]">
                      {item.referenceImageUrl ? (
                        <Image
                          source={{ uri: item.referenceImageUrl }}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="cover"
                        />
                      ) : (
                        <View className="flex-1 items-center justify-center">
                          <Ionicons
                            name="image-outline"
                            size={22}
                            color="#C9C1BB"
                          />
                        </View>
                      )}
                    </View>

                    <View className="flex-1 justify-center gap-1">
                      <View className="flex-row items-start justify-between gap-2">
                        <Text
                          className="flex-1 font-serif-bold text-[16px] text-[#26242A]"
                          numberOfLines={1}
                        >
                          {item.serviceType}
                        </Text>
                        <Ionicons
                          name="chevron-forward"
                          size={16}
                          color="#C9C1BB"
                        />
                      </View>
                      <Text className="text-[13px] text-[#817F80]">
                        Posted on {formatShortDateLabel(item.createdAt)}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="location-outline"
                          size={13}
                          color="#817F80"
                        />
                        <Text className="text-[13px] text-[#817F80]">
                          {item.city}
                        </Text>
                      </View>
                      <Text className="text-[13px] text-[#817F80]">
                        {budgetLabel(item)} ·{' '}
                        {formatDateTimeLabel(item.preferredFrom)}
                      </Text>

                      <View className="mt-1 flex-row items-center gap-1">
                        <Ionicons
                          name="people-outline"
                          size={13}
                          color="#4B2E46"
                        />
                        <Text className="text-[12px] font-bold text-[#4B2E46]">
                          {bidsSoFarLabel(item)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
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
                Filter & sort offers
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
                  categoryOptions.map((serviceType) => (
                    <Chip
                      key={serviceType}
                      label={serviceType}
                      selected={selectedCategory === serviceType}
                      onPress={() =>
                        setSelectedCategory(
                          selectedCategory === serviceType ? null : serviceType,
                        )
                      }
                    />
                  ))
                )}
              </View>

              <Text className="mb-2 mt-5 text-[13px] font-bold text-[#817F80]">
                Sort by
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {SORT_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={sortOption === option.value}
                    onPress={() => setSortOption(option.value)}
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
