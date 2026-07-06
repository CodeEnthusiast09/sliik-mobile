import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useServices } from '@/hooks/services/provider-services';
import { formatCurrency, getErrorMessage } from '@/lib/utils';

export function ProviderServicesScreen() {
  const router = useRouter();
  const {
    data: services,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useServices();

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="font-serif-bold text-[28px] leading-[34px] text-[#26242A]">
              Services
            </Text>
            <Pressable
              onPress={() => router.push('/services/new')}
              className="rounded-full bg-[#4B2E46] px-4 py-2.5"
            >
              <Text className="text-[13px] font-bold text-white">+ Add</Text>
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
                data={services}
                keyExtractor={(service) => service.id}
                contentContainerClassName="gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message="No services yet. Add one to let customers book you." />
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: '/services/[id]',
                        params: { id: item.id },
                      })
                    }
                    className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                  >
                    <Text className="font-serif-bold text-[16px] text-[#26242A]">
                      {item.name}
                    </Text>
                    <Text className="text-[13px] text-[#817F80]">
                      ₦{formatCurrency(item.price)} · {item.durationMinutes}{' '}
                      min
                      {!item.isActive ? ' · Inactive' : ''}
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
