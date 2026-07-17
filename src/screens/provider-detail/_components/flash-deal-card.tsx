import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useCountdown } from '@/hooks/common/use-countdown';
import type { Deal } from '@/interfaces/deal';
import { formatCountdown, formatCurrency } from '@/lib/utils';

export function FlashDealCard({
  deal,
  providerAvatarUrl,
}: {
  deal: Deal;
  providerAvatarUrl: string | null;
}) {
  const router = useRouter();
  const remainingMs = useCountdown(deal.expiresAt);

  if (remainingMs <= 0) return null;

  return (
    <Pressable
      // Deals have their own claim flow (date/slot selection, deal pricing) -
      // route into the existing deal-detail screen, not the plain service
      // booking screen, which would charge the full undiscounted price.
      onPress={() =>
        router.push({ pathname: '/deals/[id]', params: { id: deal.id } })
      }
      className="mt-6 flex-row gap-3 rounded-[20px] bg-[#FDEAF0] p-3"
    >
      <View className="h-24 w-24 overflow-hidden rounded-[14px] bg-[#F3F0EB]">
        {providerAvatarUrl ? (
          <Image
            source={{ uri: providerAvatarUrl }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : null}
      </View>
      <View className="flex-1 justify-center gap-1">
        <View className="flex-row items-center gap-1">
          <Ionicons name="flash" size={12} color="#E0347D" />
          <Text className="text-[11px] font-bold uppercase text-[#E0347D]">
            Flash deal
          </Text>
        </View>
        <Text className="font-serif-bold text-[15px] text-[#26242A]">
          {deal.title}
        </Text>
        <Text className="text-[12px] text-[#A8A39B] line-through">
          Was ₦{formatCurrency(deal.originalPrice)}
        </Text>
        <Text className="text-[14px] font-bold text-[#26242A]">
          Now ₦{formatCurrency(deal.dealPrice)}
        </Text>
      </View>
      <View className="items-end justify-between py-1">
        <Text className="text-[12px] font-bold text-[#E0347D]">
          {formatCountdown(remainingMs)}
        </Text>
        <View className="rounded-full bg-[#4B2E46] px-4 py-2">
          <Text className="text-[13px] font-bold text-white">Book now</Text>
        </View>
      </View>
    </Pressable>
  );
}
