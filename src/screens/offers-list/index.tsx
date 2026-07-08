import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealsOffersTabs } from '@/components/deals-offers-tabs';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useMyOffers, useOpenOffers } from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import type { Offer } from '@/interfaces/offer';
import {
  formatCurrency,
  formatDateTimeLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

function budgetLabel(offer: Offer) {
  return offer.budget
    ? `Budget ₦${formatCurrency(offer.budget)}`
    : 'Open to offers';
}

export function OffersListScreen() {
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
  const {
    data: offers,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyOffers();

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref={notificationsHref} />
          <DealsOffersTabs active="offers" />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
              Your offers
            </Text>
            <Pressable
              onPress={() => router.push('/offers/new')}
              className="rounded-full bg-[#4B2E46] px-4 py-2.5"
            >
              <Text className="text-[13px] font-bold text-white">+ Post</Text>
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
                data={offers}
                keyExtractor={(offer) => offer.id}
                contentContainerClassName="gap-3 pb-32"
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
                    className="flex-row items-center justify-between gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                  >
                    <View className="flex-1 gap-1">
                      <Text className="font-serif-bold text-[16px] text-[#26242A]">
                        {item.serviceType}
                      </Text>
                      <Text className="text-[13px] text-[#817F80]">
                        {budgetLabel(item)}
                      </Text>
                    </View>
                    <View className="rounded-full bg-[#F3F0EB] px-3 py-1.5">
                      <Text className="text-[12px] font-bold text-[#26242A]">
                        {item.responses?.length ?? 0} bid
                        {item.responses?.length === 1 ? '' : 's'}
                      </Text>
                    </View>
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
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref={notificationsHref} />
          <DealsOffersTabs active="offers" />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
              Open offers
            </Text>
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
                contentContainerClassName="gap-3 pb-32"
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
