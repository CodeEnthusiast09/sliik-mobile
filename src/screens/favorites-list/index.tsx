import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useMyFavorites, useToggleFavorite } from '@/hooks/services/favorites';
import type { Favorite } from '@/interfaces/favorite';
import { formatTradeTypeLabel, getErrorMessage } from '@/lib/utils';

function FavoriteRow({ favorite }: { favorite: Favorite }) {
  const router = useRouter();
  const provider = favorite.provider;
  const toggleFavoriteMutation = useToggleFavorite(favorite.providerId);

  if (!provider) return null;

  const rating = Number(provider.avgRating);

  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: '/provider/[id]', params: { id: provider.id } })
      }
      className="flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
    >
      <Avatar
        uri={provider.avatarUrl}
        name={provider.fullName}
        size={68}
        shape="square"
      />

      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 font-serif-bold text-[16px] text-[#26242A]"
            numberOfLines={1}
          >
            {provider.fullName}
          </Text>
          {provider.totalReviews > 0 ? (
            <Text className="text-[13px] font-bold text-[#26242A]">
              ★ {rating.toFixed(1)}
            </Text>
          ) : null}
        </View>
        <Text className="text-[13px] text-[#817F80]">
          {formatTradeTypeLabel(provider.tradeType)}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-outline" size={14} color="#948F86" />
          <Text className="text-[13px] text-[#817F80]">
            {provider.city ?? 'Location not set'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          toggleFavoriteMutation.mutate(true);
        }}
        disabled={toggleFavoriteMutation.isPending}
        hitSlop={10}
        className="h-9 w-9 items-center justify-center"
      >
        {toggleFavoriteMutation.isPending ? (
          <ActivityIndicator size="small" color="#E5484D" />
        ) : (
          <Ionicons name="heart" size={22} color="#E5484D" />
        )}
      </Pressable>
    </Pressable>
  );
}

export function FavoritesListScreen() {
  const router = useRouter();
  const {
    data: favorites,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = useMyFavorites();

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Favorites"
            notificationsHref="/home/notifications"
            onBack={() => router.back()}
            showNotifications={false}
          />

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={favorites}
                keyExtractor={(favorite) => favorite.id}
                contentContainerClassName="grow gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message="You haven't favorited any providers yet." />
                }
                renderItem={({ item }) => <FavoriteRow favorite={item} />}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
