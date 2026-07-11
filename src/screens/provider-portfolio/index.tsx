import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useAddPortfolioItem,
  useDeletePortfolioItem,
  usePortfolio,
} from '@/hooks/services/portfolio';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';

export function ProviderPortfolioScreen() {
  const router = useRouter();

  useHideTabBar();

  const {
    data: portfolio,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = usePortfolio();
  const uploadImageMutation = useUploadImage();
  const addPortfolioItemMutation = useAddPortfolioItem();
  const deletePortfolioItemMutation = useDeletePortfolioItem();

  async function handleAddPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uploadResponse = await uploadImageMutation.mutateAsync(
      result.assets[0],
    );
    if (uploadResponse.data) {
      addPortfolioItemMutation.mutate({ imageUrl: uploadResponse.data.url });
    }
  }

  function handleRemove(id: string) {
    // react-native-web's Alert.alert() is a no-op, so it needs a real
    // browser confirm() dialog on web instead.
    if (Platform.OS === 'web') {
      if (window.confirm('Remove photo? This cannot be undone.')) {
        deletePortfolioItemMutation.mutate(id);
      }
      return;
    }

    Alert.alert('Remove photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deletePortfolioItemMutation.mutate(id),
      },
    ]);
  }

  const isAdding =
    uploadImageMutation.isPending || addPortfolioItemMutation.isPending;
  const addError = uploadImageMutation.isError
    ? getErrorMessage(uploadImageMutation.error)
    : addPortfolioItemMutation.isError
      ? getErrorMessage(addPortfolioItemMutation.error)
      : null;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          <View className="mt-2 flex-row items-center justify-between">
            <Text className="font-serif-bold text-[28px] leading-[34px] text-[#26242A]">
              Portfolio
            </Text>
            <Pressable
              onPress={handleAddPhoto}
              disabled={isAdding}
              className={`rounded-full bg-[#4B2E46] px-4 py-2.5 ${isAdding ? 'opacity-50' : ''}`}
            >
              <Text className="text-[13px] font-bold text-white">
                {isAdding ? 'Adding…' : '+ Add'}
              </Text>
            </Pressable>
          </View>

          {addError ? (
            <Text className="mt-3 text-[13px] text-[#E5484D]">
              {addError}
            </Text>
          ) : null}

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={portfolio}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperClassName="gap-2"
                contentContainerClassName="grow gap-2 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message="No portfolio photos yet. Add some to showcase your work." />
                }
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleRemove(item.id)}
                    className="aspect-square flex-1 overflow-hidden rounded-[16px]"
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                    <View className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1">
                      <Text className="text-[11px] font-bold text-white">
                        Remove
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
