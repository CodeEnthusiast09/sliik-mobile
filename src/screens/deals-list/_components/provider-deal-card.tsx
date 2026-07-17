import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { Deal } from '@/interfaces/deal';
import {
  calculateDiscountPercent,
  formatCurrency,
  formatShortDateLabel,
} from '@/lib/utils';

export type DealPhase = 'active' | 'scheduled' | 'ended';

export function getDealPhase(deal: Deal): DealPhase {
  const now = new Date();
  const startsAt = deal.startsAt ? new Date(deal.startsAt) : null;
  if (startsAt && startsAt > now) return 'scheduled';
  if (deal.slotsRemaining > 0 && new Date(deal.expiresAt) > now) return 'active';
  return 'ended';
}

const DEAL_PHASE_LABEL: Record<DealPhase, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  ended: 'Ended',
};

const DEAL_PHASE_COLOR: Record<DealPhase, string> = {
  active: '#2F9E44',
  scheduled: '#4B2E46',
  ended: '#817F80',
};

export function ProviderDealCard({
  deal,
  onPress,
}: {
  deal: Deal;
  onPress: () => void;
}) {
  const phase = getDealPhase(deal);
  const percent = calculateDiscountPercent(
    Number(deal.originalPrice),
    Number(deal.dealPrice),
  );
  const slotsUsed = deal.slotsTotal - deal.slotsRemaining;
  const progress = deal.slotsTotal > 0 ? slotsUsed / deal.slotsTotal : 0;
  const phaseColor = DEAL_PHASE_COLOR[phase];

  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
    >
      <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-[14px] bg-[#F3F0EB]">
        {deal.service?.imageUrl ? (
          <Image
            source={{ uri: deal.service.imageUrl }}
            style={{ width: 80, height: 80 }}
            contentFit="cover"
          />
        ) : (
          <Ionicons name="pricetag-outline" size={22} color="#A8A39B" />
        )}
      </View>

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text
            className="flex-1 font-serif-bold text-[16px] text-[#26242A]"
            numberOfLines={1}
          >
            {deal.title}
          </Text>
          <View
            style={{
              backgroundColor: `${phaseColor}1F`,
              borderColor: phaseColor,
              borderWidth: 1,
            }}
            className="rounded-lg px-2 py-1"
          >
            <Text
              style={{ color: phaseColor }}
              className="text-[11px] font-bold"
            >
              {DEAL_PHASE_LABEL[phase]}
            </Text>
          </View>
        </View>

        <Text className="text-[12px] text-[#817F80]" numberOfLines={1}>
          {deal.service?.name ?? 'Service'}
        </Text>

        <View className="flex-row items-center gap-2">
          <Text className="font-serif-bold text-[15px] text-[#26242A]">
            ₦{formatCurrency(deal.dealPrice)}
          </Text>
          <Text className="text-[12px] text-[#A8A39B] line-through">
            ₦{formatCurrency(deal.originalPrice)}
          </Text>
          <View className="rounded-md bg-[#4B2E461A] px-1.5 py-0.5">
            <Text className="text-[10px] font-bold text-[#4B2E46]">
              {percent}% OFF
            </Text>
          </View>
        </View>

        {phase === 'active' ? (
          <View className="mt-1 gap-1">
            <View className="h-1.5 overflow-hidden rounded-full bg-[#F3F0EB]">
              <View
                className="h-full rounded-full bg-[#4B2E46]"
                style={{ width: `${Math.min(progress * 100, 100)}%` }}
              />
            </View>
            <Text className="text-[11px] text-[#817F80]">
              {slotsUsed} of {deal.slotsTotal} slots booked
            </Text>
          </View>
        ) : phase === 'scheduled' && deal.startsAt ? (
          <Text className="mt-1 text-[11px] text-[#817F80]">
            Starts {formatShortDateLabel(deal.startsAt)}
          </Text>
        ) : (
          <Text className="mt-1 text-[11px] text-[#817F80]">
            Ended {formatShortDateLabel(deal.expiresAt)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
