import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import {
  useFavoriteStatus,
  useToggleFavorite,
} from '@/hooks/services/favorites';
import type { ProviderProfile } from '@/interfaces/provider';
import { formatTradeTypeLabel } from '@/lib/utils';

export function ProviderResultCard({
  provider,
  distanceLabel,
  onPress,
}: {
  provider: ProviderProfile;
  distanceLabel: string | null;
  onPress: () => void;
}) {
  const { data: favoriteStatus } = useFavoriteStatus(provider.id);
  const toggleFavoriteMutation = useToggleFavorite(provider.id);
  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const rating = Number(provider.avgRating);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View ${provider.fullName}'s profile`}
      className="relative flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
    >
      <Avatar
        uri={provider.avatarUrl}
        name={provider.fullName}
        size={68}
        shape="square"
      />

      <View className="flex-1 gap-1 pr-7">
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
        <Text className="text-[13px] text-[#817F80]" numberOfLines={1}>
          {formatTradeTypeLabel(provider.tradeType)}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-1">
            <Ionicons name="location-outline" size={14} color="#948F86" />
            <Text
              className="flex-1 text-[13px] text-[#817F80]"
              numberOfLines={1}
            >
              {provider.city ?? 'Location not set'}
            </Text>
          </View>
          {distanceLabel ? (
            <Text className="ml-2 text-[13px] text-[#817F80]">
              {distanceLabel}
            </Text>
          ) : null}
        </View>
      </View>

      <Pressable
        onPress={(event) => {
          event.stopPropagation();
          toggleFavoriteMutation.mutate(isFavorited);
        }}
        disabled={toggleFavoriteMutation.isPending}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorited ? 'Remove from favorites' : 'Add to favorites'
        }
        accessibilityState={{
          disabled: toggleFavoriteMutation.isPending,
          selected: isFavorited,
        }}
        hitSlop={8}
        className="absolute right-3 top-3 h-7 w-7 items-center justify-center rounded-full bg-[#F7F3EE]"
      >
        <Ionicons
          name={isFavorited ? 'heart' : 'heart-outline'}
          size={15}
          color={isFavorited ? '#E5484D' : '#26242A'}
        />
      </Pressable>
    </Pressable>
  );
}
