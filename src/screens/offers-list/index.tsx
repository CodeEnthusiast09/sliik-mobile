import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { DealsOffersTabs } from '@/components/deals-offers-tabs';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { StatusPill } from '@/components/status-pill';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useMyOffers, useOpenOffers } from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import type { Offer } from '@/interfaces/offer';
import {
  formatCurrency,
  formatDateTimeLabel,
  formatShortDateLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function offerFooterLabel(offer: Offer) {
  if (offer.status === 'cancelled') return 'Offer cancelled';
  if (offer.status === 'expired') return 'Offer expired';
  if (offer.status === 'accepted') return 'Provider selected';
  const count = offer.responses?.length ?? 0;
  return `${count} application${count === 1 ? '' : 's'}`;
}

function budgetLabel(offer: Offer) {
  return offer.budget
    ? `Budget ₦${formatCurrency(offer.budget)}`
    : 'Open to offers';
}

export function OffersListScreen() {
  useHideTabBar();

  const role = useAuthStore((state) => state.role);
  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  return role === 'provider' ? (
    <ProviderOffersFeed notificationsHref={notificationsHref} />
  ) : (
    <CustomerOffersList notificationsHref={notificationsHref} />
  );
}

function CustomerOffersList({
  notificationsHref,
}: {
  notificationsHref: '/home/notifications' | '/profile/notifications';
}) {
  const router = useRouter();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const {
    data: offers,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyOffers();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader title="My offers" notificationsHref={notificationsHref} />
          <DealsOffersTabs active="offers" />

          {bannerDismissed ? null : (
            <View className="mt-4 flex-row items-start gap-3 rounded-2xl bg-[#4B2E461A] p-3.5">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#4B2E462E]">
                <Ionicons name="calendar-outline" size={18} color="#4B2E46" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[13px] font-bold text-[#4B2E46]">
                  You post it. Providers respond.
                </Text>
                <Text className="text-[12px] text-[#6B5F68]">
                  Review offers and choose the best match.
                </Text>
              </View>
              <Pressable
                onPress={() => setBannerDismissed(true)}
                hitSlop={10}
                className="mt-0.5"
              >
                <Ionicons name="close" size={16} color="#948F86" />
              </Pressable>
            </View>
          )}

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={offers}
                keyExtractor={(offer) => offer.id}
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message="No offers posted yet. Post one to get price offers from providers." />
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
                      <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-1 gap-1">
                          <Text
                            className="font-serif-bold text-[16px] text-[#26242A]"
                            numberOfLines={1}
                          >
                            {item.serviceType}
                          </Text>
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
                        </View>

                        <View className="flex-row items-center gap-1">
                          <StatusPill status={item.status} />
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color="#C9C1BB"
                          />
                        </View>
                      </View>

                      <View className="mt-1 flex-row items-center gap-1">
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color="#817F80"
                        />
                        <Text className="text-[13px] text-[#817F80]">
                          {offerFooterLabel(item)}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                )}
              />
            )}
          </View>

          <View className="mb-4 mt-3">
            <Button
              label="Post offer"
              onPress={() => router.push('/offers/new')}
              leftIcon={
                <View className="h-6 w-6 items-center justify-center rounded-full bg-[#F7EFE4]">
                  <Ionicons name="add" size={16} color="#4B2E46" />
                </View>
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function ProviderOffersFeed({
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

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader title="Open offers" notificationsHref={notificationsHref} />
          <DealsOffersTabs active="offers" />

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

          <View className="mt-4 flex-1">
            {isProviderError ? (
              <ErrorState
                message={getErrorMessage(providerError)}
                onRetry={refetchProvider}
              />
            ) : isLoadingProvider ? (
              <ActivityIndicator className="mt-4" color="#4B2E46" />
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
                data={offers}
                keyExtractor={(offer) => offer.id}
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState
                    message={`No open offers in ${provider.city} right now.`}
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
                    className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                  >
                    <Text className="font-serif-bold text-[16px] text-[#26242A]">
                      {item.serviceType}
                    </Text>
                    <Text className="text-[13px] text-[#817F80]">
                      {budgetLabel(item)} · Preferred:{' '}
                      {formatDateTimeLabel(item.preferredFrom)}
                    </Text>
                    <Text
                      className="text-[13px] text-[#817F80]"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
