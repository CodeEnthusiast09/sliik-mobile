import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DealsOffersTabs } from '@/components/deals-offers-tabs';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useActiveDeals, useMyDeals } from '@/hooks/services/deals';
import type { Deal } from '@/interfaces/deal';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

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

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref={notificationsHref} />
          <DealsOffersTabs active="deals" />

          <Text className="mt-4 font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
            Flash deals
          </Text>

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
                  <EmptyState message="No active deals right now. Check back soon." />
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
          <ScreenHeader notificationsHref={notificationsHref} />
          <DealsOffersTabs active="deals" />

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
              Posted deals
            </Text>
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
