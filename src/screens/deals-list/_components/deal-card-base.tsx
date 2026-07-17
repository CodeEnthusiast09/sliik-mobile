import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCountdown } from '@/hooks/common/use-countdown';
import type { Deal } from '@/interfaces/deal';
import {
  calculateDiscountPercent,
  formatCountdown,
  formatCurrency,
} from '@/lib/utils';

export function DealCardBase({
  deal,
  onPress,
  topRight,
  subtitle,
}: {
  deal: Deal;
  onPress: () => void;
  topRight: ReactNode;
  subtitle: string;
}) {
  const photoUrl = deal.provider?.portfolio?.[0]?.imageUrl;
  const remainingMs = useCountdown(deal.expiresAt);
  const isLive = deal.slotsRemaining > 0 && remainingMs > 0;
  const percent = calculateDiscountPercent(
    Number(deal.originalPrice),
    Number(deal.dealPrice),
  );

  return (
    <Pressable
      onPress={onPress}
      className="h-52 overflow-hidden rounded-[20px] bg-[#2A2226]"
    >
      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          contentFit="cover"
        />
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.88)']}
        locations={[0, 0.4, 1]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <View className="absolute left-3 top-3 rounded-full bg-[#4B2E46] px-2.5 py-1">
        <Text className="text-[11px] font-bold text-white">
          {percent}% OFF
        </Text>
      </View>
      <View className="absolute right-3 top-3">{topRight}</View>

      <View className="absolute bottom-0 left-0 right-0 gap-1 p-4">
        <Text
          className="font-serif-bold text-[18px] leading-[22px] text-white"
          numberOfLines={2}
        >
          {deal.title}
        </Text>
        <Text className="text-[13px] text-[#E7E1DC]">{subtitle}</Text>
        <View className="flex-row items-center gap-2">
          <Text className="font-serif-bold text-[18px] text-white">
            ₦{formatCurrency(deal.dealPrice)}
          </Text>
          <Text className="text-[13px] text-[#C9C1BB] line-through">
            ₦{formatCurrency(deal.originalPrice)}
          </Text>
        </View>
      </View>

      {isLive ? (
        <View className="absolute bottom-3 right-3 flex-row items-center gap-1 rounded-full bg-black/55 px-2.5 py-1">
          <Ionicons name="time-outline" size={11} color="white" />
          <Text className="text-[11px] font-bold text-white">
            Ends in {formatCountdown(remainingMs)}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
