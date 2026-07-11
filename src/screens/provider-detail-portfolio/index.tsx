import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import { getErrorMessage } from '@/lib/utils';

export function ProviderDetailPortfolioScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useHideTabBar();

  const {
    data: provider,
    isLoading,
    isError,
    error,
    refetch,
  } = usePublicProviderProfile(id);

  const photos = provider?.portfolio ?? [];

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Portfolio"
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
              data={photos}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperClassName="gap-2"
              contentContainerClassName="gap-2 pb-8"
              renderItem={({ item, index }) => (
                <Pressable
                  onPress={() => setViewerIndex(index)}
                  className="aspect-square flex-1 overflow-hidden rounded-[16px]"
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                </Pressable>
              )}
              ListEmptyComponent={
                <Text className="mt-3 text-[13px] text-[#817F80]">
                  No portfolio photos yet.
                </Text>
              }
            />
          )}
        </View>
      </SafeAreaView>

      <Modal
        visible={viewerIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewerIndex(null)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <Pressable
              onPress={() => setViewerIndex(null)}
              hitSlop={10}
              className="absolute right-4 top-4 z-10 h-10 w-10 items-center justify-center rounded-full bg-black/50"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            {viewerIndex !== null ? (
              <View className="flex-1 items-center justify-center">
                <Image
                  source={{ uri: photos[viewerIndex].imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="contain"
                />
              </View>
            ) : null}

            {viewerIndex !== null && photos.length > 1 ? (
              <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-center gap-10">
                <Pressable
                  onPress={() =>
                    setViewerIndex((i) => ((i as number) - 1 + photos.length) % photos.length)
                  }
                  hitSlop={10}
                >
                  <Ionicons name="chevron-back-circle" size={40} color="#FFFFFF" />
                </Pressable>
                <Text className="text-[14px] font-bold text-white">
                  {viewerIndex + 1} / {photos.length}
                </Text>
                <Pressable
                  onPress={() =>
                    setViewerIndex((i) => ((i as number) + 1) % photos.length)
                  }
                  hitSlop={10}
                >
                  <Ionicons name="chevron-forward-circle" size={40} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : null}
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
