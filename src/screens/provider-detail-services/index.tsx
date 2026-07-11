import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import { formatCurrency, formatDurationLabel, getErrorMessage } from '@/lib/utils';

export function ProviderDetailServicesScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  useHideTabBar();

  const {
    data: provider,
    isLoading,
    isError,
    error,
    refetch,
  } = usePublicProviderProfile(id);

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Services"
            notificationsHref="/home/notifications"
            onBack={() => router.back()}
            showNotifications={false}
          />

          {isLoading ? (
            <ListSkeleton />
          ) : isError || !provider ? (
            <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
          ) : (
            <FlatList
              showsVerticalScrollIndicator={false}
              data={provider.services ?? []}
              keyExtractor={(service) => service.id}
              contentContainerClassName="gap-3 pb-8 pt-2"
              renderItem={({ item: service }) => (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/home/book',
                      params: { providerId: provider.id, serviceId: service.id },
                    })
                  }
                  className="gap-2 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 pr-2 font-serif-bold text-[16px] text-[#26242A]">
                      {service.name}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color="#A8A39B" />
                  </View>
                  {service.description ? (
                    <Text className="text-[13px] text-[#817F80]">
                      {service.description}
                    </Text>
                  ) : null}
                  <View className="flex-row items-center justify-between border-t border-[#F3F0EB] pt-2">
                    <Text className="text-[13px] text-[#817F80]">
                      {formatDurationLabel(service.durationMinutes)}
                    </Text>
                    <Text className="text-[15px] font-bold text-[#4B2E46]">
                      ₦{formatCurrency(service.price)}
                    </Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <Text className="mt-3 text-[13px] text-[#817F80]">
                  No services listed yet.
                </Text>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
