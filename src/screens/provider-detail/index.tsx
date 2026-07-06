import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ErrorState } from '@/components/error-state';
import { ReviewsList } from '@/components/reviews-list';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import { useReviewsForUser } from '@/hooks/services/reviews';
import { formatCurrency, getErrorMessage } from '@/lib/utils';

export function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

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

  if (isError) {
    return (
      <View className="flex-1 bg-[#FBF8F3]">
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
      <View className="flex-1 bg-[#FBF8F3]">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const rating = Number(provider.avgRating);

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            notificationsHref="/home/notifications"
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32"
          >
            <View className="items-center gap-1 pb-3 pt-2">
              <Avatar
                uri={provider.avatarUrl}
                name={provider.fullName}
                size={96}
              />
              <Text className="mt-2 font-serif-bold text-[24px] leading-[30px] text-[#26242A]">
                {provider.fullName}
              </Text>
              <Text className="text-[14px] text-[#817F80]">
                {provider.tradeType}
                {provider.city ? ` · ${provider.city}` : ''}
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                {provider.totalReviews > 0
                  ? `★ ${rating.toFixed(1)} (${provider.totalReviews} review${provider.totalReviews === 1 ? '' : 's'})`
                  : 'No reviews yet'}
              </Text>
              {provider.yearsExperience > 0 ? (
                <Text className="text-[12px] text-[#A8A39B]">
                  {provider.yearsExperience} year
                  {provider.yearsExperience === 1 ? '' : 's'} of experience
                </Text>
              ) : null}
            </View>

            {provider.bio ? (
              <Text className="py-2 text-[14px] text-[#26242A]">
                {provider.bio}
              </Text>
            ) : null}

            <Text className="mt-5 font-serif-bold text-[18px] text-[#26242A]">
              Services
            </Text>
            {provider.services?.length ? (
              <View className="mt-3 gap-2">
                {provider.services.map((service) => (
                  <Pressable
                    key={service.id}
                    onPress={() =>
                      router.push({
                        pathname: '/home/book',
                        params: {
                          providerId: provider.id,
                          serviceId: service.id,
                        },
                      })
                    }
                    className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                  >
                    <Text className="font-serif-bold text-[15px] text-[#26242A]">
                      {service.name}
                    </Text>
                    {service.description ? (
                      <Text className="text-[13px] text-[#817F80]">
                        {service.description}
                      </Text>
                    ) : null}
                    <Text className="text-[13px] text-[#817F80]">
                      ₦{formatCurrency(service.price)} ·{' '}
                      {service.durationMinutes} min
                    </Text>
                    <Text className="text-[13px] font-bold text-[#4B2E46]">
                      Book this service
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-[13px] text-[#817F80]">
                No services listed yet.
              </Text>
            )}

            {provider.deals?.length ? (
              <>
                <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
                  Flash deals
                </Text>
                <View className="mt-3 gap-2">
                  {provider.deals.map((deal) => (
                    <Pressable
                      key={deal.id}
                      onPress={() =>
                        router.push({
                          pathname: '/deals/[id]',
                          params: { id: deal.id },
                        })
                      }
                      className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                    >
                      <Text className="font-serif-bold text-[15px] text-[#26242A]">
                        {deal.title}
                      </Text>
                      <Text className="text-[13px] text-[#817F80]">
                        ₦{formatCurrency(deal.dealPrice)} (was ₦
                        {formatCurrency(deal.originalPrice)}) ·{' '}
                        {deal.slotsRemaining} slot
                        {deal.slotsRemaining === 1 ? '' : 's'} left
                      </Text>
                      <Text className="text-[13px] font-bold text-[#4B2E46]">
                        View deal
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : null}

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Portfolio
            </Text>
            {provider.portfolio?.length ? (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={provider.portfolio}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperClassName="gap-2"
                contentContainerClassName="mt-3 gap-2"
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View className="aspect-square flex-1 overflow-hidden rounded-[16px]">
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                  </View>
                )}
              />
            ) : (
              <Text className="mt-3 text-[13px] text-[#817F80]">
                No portfolio photos yet.
              </Text>
            )}

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Reviews
            </Text>
            <View className="mt-3">
              <ReviewsList
                averageRating={userReviews?.averageRating ?? null}
                totalReviews={userReviews?.totalReviews ?? 0}
                reviews={userReviews?.reviews ?? []}
                isLoading={isLoadingReviews}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
