import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { useFavoriteStatus, useToggleFavorite } from '@/hooks/services/favorites';
import type { ProviderProfile } from '@/interfaces/provider';
import { formatTradeTypeLabel } from '@/lib/utils';

export function RecommendedProviderCard({
  provider,
  onPress,
  distanceLabel,
}: {
  provider: ProviderProfile;
  onPress: () => void;
  distanceLabel: string | null;
}) {
  const { data: favoriteStatus } = useFavoriteStatus(provider.id);
  const toggleFavoriteMutation = useToggleFavorite(provider.id);
  const isFavorited = favoriteStatus?.isFavorited ?? false;
  const rating = Number(provider.avgRating);

  return (
    <Pressable onPress={onPress} className="w-[140px] gap-2">
      <View style={{ position: 'relative' }}>
        <Avatar
          uri={provider.avatarUrl}
          name={provider.fullName}
          size={140}
          shape="square"
        />
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            toggleFavoriteMutation.mutate(isFavorited);
          }}
          disabled={toggleFavoriteMutation.isPending}
          hitSlop={8}
          className="absolute right-1.5 top-1.5 h-7 w-7 items-center justify-center rounded-full bg-white/90"
        >
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={15}
            color={isFavorited ? '#E5484D' : '#26242A'}
          />
        </Pressable>
      </View>

      <View className="gap-0.5">
        <Text
          className="font-serif-bold text-[14px] text-[#26242A]"
          numberOfLines={1}
        >
          {provider.fullName}
        </Text>
        <Text className="text-[12px] text-[#817F80]" numberOfLines={1}>
          {formatTradeTypeLabel(provider.tradeType)}
        </Text>
        <View className="flex-row items-center justify-between">
          {provider.totalReviews > 0 ? (
            <Text className="text-[11px] font-bold text-[#26242A]">
              ★ {rating.toFixed(1)}
            </Text>
          ) : (
            <View />
          )}
          {distanceLabel ? (
            <Text className="text-[11px] text-[#817F80]">{distanceLabel}</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
