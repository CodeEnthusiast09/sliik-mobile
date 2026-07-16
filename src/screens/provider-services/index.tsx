import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useServices } from '@/hooks/services/provider-services';
import { formatCurrency, formatDurationLabel, getErrorMessage } from '@/lib/utils';

export function ProviderServicesScreen() {
  const router = useRouter();

  useHideTabBar();

  const {
    data: services,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useServices();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Services"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
            rightAction={
              <Pressable onPress={() => router.push('/services/new')} hitSlop={10}>
                <Text className="text-[13px] font-bold text-[#4B2E46]">Add</Text>
              </Pressable>
            }
          />

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
                contentContainerClassName="grow gap-3 pb-32"
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
                    className="flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                  >
                    <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[12px] bg-[#F3F0EB]">
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          style={{ width: 56, height: 56 }}
                          contentFit="cover"
                        />
                      ) : (
                        <Ionicons name="image-outline" size={20} color="#A8A39B" />
                      )}
                    </View>

                    <View className="flex-1 gap-0.5">
                      <Text className="font-serif-bold text-[16px] text-[#26242A]">
                        {item.name}
                      </Text>
                      <Text className="text-[13px] text-[#817F80]">
                        ₦{formatCurrency(item.price)} ·{' '}
                        {formatDurationLabel(item.durationMinutes)}
                      </Text>
                    </View>

                    <View
                      className={`rounded-lg px-2 py-1 ${item.isActive ? 'bg-[#2F9E441F]' : 'bg-[#8888881F]'}`}
                    >
                      <Text
                        className={`text-[12px] font-semibold ${item.isActive ? 'text-[#2F9E44]' : 'text-[#817F80]'}`}
                      >
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>

                    <Ionicons name="chevron-forward" size={18} color="#A8A39B" />
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
