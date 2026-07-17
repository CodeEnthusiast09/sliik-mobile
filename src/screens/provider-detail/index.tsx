import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { ReviewsList } from '@/components/reviews-list';
import { DetailSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import { useFavoriteStatus, useToggleFavorite } from '@/hooks/services/favorites';
import { useReviewsForUser } from '@/hooks/services/reviews';
import {
  calculateDistanceKm,
  formatCurrency,
  formatDurationLabel,
  formatTradeTypeLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useLocationStore } from '@/store/location';

import { FlashDealCard } from './_components/flash-deal-card';

const SERVICES_PREVIEW_COUNT = 4;
const PORTFOLIO_PREVIEW_COUNT = 4;
const REVIEWS_PREVIEW_COUNT = 1;

export function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const userCoords = useLocationStore((state) => state.coords);

  // Same defensive request as customer-home - an already-logged-in session
  // never re-fires the login-time request, so ask again here too.
  useEffect(() => {
    useLocationStore.getState().requestLocation();
  }, []);

  useHideTabBar();

  const {
    data: provider,
    isLoading,
    isError,
    error,
    refetch,
  } = usePublicProviderProfile(id);
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(
    provider?.userId,
  );
  const { data: favoriteStatus } = useFavoriteStatus(provider?.id);
  const toggleFavorite = useToggleFavorite(provider?.id ?? '');

  const soonestDeal = provider?.deals?.length
    ? [...provider.deals].sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    )[0]
    : null;

  if (isError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoading || !provider) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const rating = Number(provider.avgRating);
  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const distanceLabel =
    userCoords && provider.latitude != null && provider.longitude != null
      ? `${calculateDistanceKm(userCoords.lat, userCoords.lng, provider.latitude, provider.longitude).toFixed(1)} km`
      : null;
  const cityLabel = provider.city ? `${provider.city}` : null;
  const locationLabel =
    [cityLabel, distanceLabel].filter(Boolean).join(' · ') || null;

  const servicesPreview = provider.services?.slice(0, SERVICES_PREVIEW_COUNT) ?? [];
  const hasMoreServices = (provider.services?.length ?? 0) > SERVICES_PREVIEW_COUNT;

  const portfolioPreview = provider.portfolio?.slice(0, PORTFOLIO_PREVIEW_COUNT) ?? [];
  const portfolioOverflowCount = (provider.portfolio?.length ?? 0) - PORTFOLIO_PREVIEW_COUNT;

  const hasMoreReviews = (userReviews?.totalReviews ?? 0) > REVIEWS_PREVIEW_COUNT;

  function handleShare() {
    const link = Linking.createURL(`/home/${provider!.id}`);
    Share.share({
      message: `Check out ${provider!.fullName} (${formatTradeTypeLabel(provider!.tradeType)}) on Sliik! ${link}`,
    });
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <View className="flex-row items-center justify-between py-2">
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              className="h-9 w-9 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={28} color="#4B2E46" />
            </Pressable>
            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={handleShare}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center rounded-full border border-[#ECE7E0]"
              >
                <Ionicons name="share-outline" size={18} color="#26242A" />
              </Pressable>
              <Pressable
                onPress={() => toggleFavorite.mutate(isFavorited)}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center rounded-full border border-[#ECE7E0]"
              >
                <Ionicons
                  name={isFavorited ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isFavorited ? '#E5484D' : '#26242A'}
                />
              </Pressable>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-6"
          >
            <View className="flex-row gap-4 pb-3 pt-2">
              <Avatar
                uri={provider.avatarUrl}
                name={provider.fullName}
                size={96}
                shape="square"
              />
              <View className="flex-1 gap-1 pt-1">
                <Text className="font-serif-bold text-[20px] leading-[26px] text-[#26242A]">
                  {provider.fullName}
                </Text>
                <Text className="text-[14px] text-[#817F80]">
                  {formatTradeTypeLabel(provider.tradeType)}
                </Text>
                <Text className="text-[13px] text-[#817F80]">
                  {provider.totalReviews > 0
                    ? `★ ${rating.toFixed(1)} (${provider.totalReviews} review${provider.totalReviews === 1 ? '' : 's'})`
                    : 'No reviews yet'}
                </Text>
                {locationLabel ? (
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="location-outline" size={13} color="#817F80" />
                    <Text className="text-[13px] text-[#817F80]">
                      {locationLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {provider.bio ? (
              <Text className="py-2 text-[14px] text-[#26242A]">
                {provider.bio}
              </Text>
            ) : null}

            <View className="mt-5 flex-row items-center justify-between">
              <Text className="font-serif-bold text-[18px] text-[#26242A]">
                Services
              </Text>
              {hasMoreServices ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/provider/[id]/services',
                      params: { id: provider.id },
                    })
                  }
                >
                  <Text className="text-[13px] font-bold text-[#4B2E46]">
                    View all
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {servicesPreview.length ? (
              <View className="mt-2">
                {servicesPreview.map((service, index) => (
                  <Pressable
                    key={service.id}
                    onPress={() =>
                      router.push({
                        pathname: '/provider/book',
                        params: {
                          providerId: provider.id,
                          serviceId: service.id,
                        },
                      })
                    }
                    className={`flex-row items-center justify-between py-3 ${index === servicesPreview.length - 1 ? '' : 'border-b border-[#ECE7E0]'}`}
                  >
                    <Text
                      className="flex-1 pr-2 text-[14px] font-semibold text-[#26242A]"
                      numberOfLines={1}
                    >
                      {service.name}
                    </Text>
                    <Text className="pr-3 text-[13px] text-[#A8A39B]">
                      {formatDurationLabel(service.durationMinutes)}
                    </Text>
                    <Text className="pr-2 text-[14px] font-bold text-[#26242A]">
                      ₦{formatCurrency(service.price)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#A8A39B" />
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-[13px] text-[#817F80]">
                No services listed yet.
              </Text>
            )}

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Portfolio
            </Text>
            {portfolioPreview.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="mt-3 gap-2"
              >
                {portfolioPreview.map((item, index) => {
                  const isOverflowTile =
                    index === portfolioPreview.length - 1 &&
                    portfolioOverflowCount > 0;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() =>
                        router.push({
                          pathname: '/provider/[id]/portfolio',
                          params: { id: provider.id },
                        })
                      }
                      className="h-20 w-20 overflow-hidden rounded-[16px] bg-[#F3F0EB]"
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                      {isOverflowTile ? (
                        <View className="absolute bottom-0 left-0 right-0 top-0 items-center justify-center bg-black/50">
                          <Text className="text-[15px] font-bold text-white">
                            +{portfolioOverflowCount}
                          </Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : (
              <Text className="mt-3 text-[13px] text-[#817F80]">
                No portfolio photos yet.
              </Text>
            )}

            {soonestDeal ? (
              <FlashDealCard
                deal={soonestDeal}
                providerAvatarUrl={provider.avatarUrl}
              />
            ) : null}

            <View className="mt-7 flex-row items-center justify-between">
              <Text className="font-serif-bold text-[18px] text-[#26242A]">
                Reviews{provider.totalReviews > 0 ? ` (${provider.totalReviews})` : ''}
              </Text>
              {hasMoreReviews ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/provider/[id]/reviews',
                      params: { id: provider.id },
                    })
                  }
                >
                  <Text className="text-[13px] font-bold text-[#4B2E46]">
                    View all
                  </Text>
                </Pressable>
              ) : null}
            </View>
            <View className="mt-3">
              <ReviewsList
                averageRating={userReviews?.averageRating ?? null}
                totalReviews={userReviews?.totalReviews ?? 0}
                reviews={userReviews?.reviews.slice(0, REVIEWS_PREVIEW_COUNT) ?? []}
                isLoading={isLoadingReviews}
              />
            </View>
          </ScrollView>

          <View className="mb-3">
            <Button
              label="Book"
              onPress={() =>
                router.push({
                  pathname: '/provider/[id]/services',
                  params: { id: provider.id },
                })
              }
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
