import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useMyResponses } from '@/hooks/services/offers';
import { formatCurrency, formatDateTimeLabel, getErrorMessage } from '@/lib/utils';

const STATUS_COLOR = {
  pending: '#E0A800',
  accepted: '#2F9E44',
  declined: '#E5484D',
} as const;

export function ProviderBidsScreen() {
  const router = useRouter();

  useHideTabBar();

  const {
    data: responses,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyResponses();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="My bids"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={responses}
                keyExtractor={(response) => response.id}
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState
                    message="No bids yet. Browse open offers to submit one."
                    actionLabel="Browse open offers"
                    onAction={() => router.back()}
                  />
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/offers/[id]',
                        params: { id: item.offerId },
                      })
                    }
                    className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                  >
                    <Text className="font-serif-bold text-[16px] text-[#26242A]">
                      {item.offer?.serviceType ?? 'Offer'}
                    </Text>
                    <Text className="text-[13px] text-[#817F80]">
                      Your price: ₦{formatCurrency(item.offeredPrice)}
                      {item.offer
                        ? ` · Preferred: ${formatDateTimeLabel(item.offer.preferredFrom)}`
                        : ''}
                    </Text>
                    <View
                      style={{
                        backgroundColor: `${STATUS_COLOR[item.status]}1F`,
                      }}
                      className="mt-1 self-start rounded-full px-3 py-1.5"
                    >
                      <Text
                        style={{ color: STATUS_COLOR[item.status] }}
                        className="text-[12px] font-bold"
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
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
