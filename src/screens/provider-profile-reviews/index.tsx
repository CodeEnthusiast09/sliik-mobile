import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { ReviewsList } from '@/components/reviews-list';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useProviderProfile } from '@/hooks/services/provider';
import { useReviewsForUser } from '@/hooks/services/reviews';
import { getErrorMessage } from '@/lib/utils';

export function ProviderProfileReviewsScreen() {
  const router = useRouter();

  useHideTabBar();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useProviderProfile();
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(
    profile?.userId,
  );

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Reviews"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
            showNotifications={false}
          />

          {isError || !profile ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : isLoading ? (
            <ListSkeleton />
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-8"
            >
              <ReviewsList
                averageRating={userReviews?.averageRating ?? null}
                totalReviews={userReviews?.totalReviews ?? 0}
                reviews={userReviews?.reviews ?? []}
                isLoading={isLoadingReviews}
              />
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
