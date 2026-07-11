import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
  /** Tighter padding/font so a row of several chips can fit without scrolling. */
  compact?: boolean;
  /** Bigger padding/font for enhanced visual emphasis or touch targets. */
  spacious?: boolean;
};

export function Chip({ label, selected, onPress, icon, compact, spacious }: ChipProps) {
  // Determine layout sizes based on props, falling back to standard sizing
  const paddingClass = compact ? 'px-2 py-1.5' : spacious ? 'px-5 py-3' : 'px-3.5 py-2';
  const textSizeClass = compact ? 'text-[12px]' : spacious ? 'text-[16px]' : 'text-[13px]';

  return (
    <Pressable
      onPress={onPress}
      className={`rounded-xl ${paddingClass} ${selected
        ? 'border-[1px] border-[#4B2E46] bg-[#4B2E4620]'
        : 'border border-[#DCD6C8] bg-white'
        }`}
    >
      <View className="flex-row items-center gap-1">
        <Text
          className={`${textSizeClass} font-bold capitalize ${selected ? 'text-[#4B2E46]' : 'text-[#26242A]'}`}
        >
          {label}
        </Text>
        {icon}
      </View>
    </Pressable>
  );
}
