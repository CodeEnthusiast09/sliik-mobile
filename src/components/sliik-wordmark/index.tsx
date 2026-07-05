import { Text, View } from 'react-native';

import { SliikMark } from '@/components/sliik-mark';

export type SliikWordmarkProps = {
  /** Height of the mark; the "liik" text and its connecting offset scale with it. */
  height?: number;
};

export function SliikWordmark({ height = 30 }: SliikWordmarkProps) {
  return (
    <View className="flex-row items-center justify-center">
      <SliikMark height={height} color="#4B2E46" />
      <Text
        className="font-serif-bold text-[#26242A]"
        style={{ fontSize: height * (28 / 30), marginLeft: height * (-3 / 30) }}
      >
        l<Text className="text-[#4B2E46]">ii</Text>k
      </Text>
    </View>
  );
}
