import { Text, View } from 'react-native';

export function HomeListHeader({
  hasActiveFilter,
  locationLabel,
}: {
  hasActiveFilter: boolean;
  locationLabel: string;
}) {
  return (
    <View className="pb-3">
      <Text className="font-serif-bold text-[18px] text-[#26242A]">
        {hasActiveFilter ? 'Search results' : `Providers near ${locationLabel}`}
      </Text>
    </View>
  );
}
