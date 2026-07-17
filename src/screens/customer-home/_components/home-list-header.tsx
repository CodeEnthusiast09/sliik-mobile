import { ScrollView, Text, View } from 'react-native';

import type { ProviderProfile } from '@/interfaces/provider';

import { HeroBanner } from './hero-banner';
import { RecommendedProviderCard } from './recommended-provider-card';

export function HomeListHeader({
  recommended,
  hasActiveFilter,
  getDistanceLabel,
  onPressProvider,
  onPressBookNow,
}: {
  recommended: ProviderProfile[];
  hasActiveFilter: boolean;
  getDistanceLabel: (provider: ProviderProfile) => string | null;
  onPressProvider: (provider: ProviderProfile) => void;
  onPressBookNow: () => void;
}) {
  if (hasActiveFilter || recommended.length === 0) return null;

  return (
    <View className="gap-5 pb-5">
      <HeroBanner onPressBookNow={onPressBookNow} />

      <View>
        <Text className="font-serif-bold text-[18px] text-[#26242A]">
          Recommended for you
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3"
          contentContainerClassName="gap-3 pr-6"
        >
          {recommended.map((provider) => (
            <RecommendedProviderCard
              key={provider.id}
              provider={provider}
              distanceLabel={getDistanceLabel(provider)}
              onPress={() => onPressProvider(provider)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
