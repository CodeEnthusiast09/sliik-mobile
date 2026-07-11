import { Pressable, Text, View } from 'react-native';

export type DateChipProps = {
  topLabel: string;
  day: number;
  month: string | null;
  selected: boolean;
  onPress: () => void;
};

export function DateChip({ topLabel, day, month, selected, onPress }: DateChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-[54px] items-center gap-0.5 rounded-2xl border py-2 ${
        selected ? 'border-[#4B2E46] bg-[#4B2E46]' : 'border-[#ECE7E0] bg-white'
      }`}
    >
      <Text
        className={`text-[10px] font-medium ${selected ? 'text-[#F7EFE4]' : 'text-[#817F80]'}`}
        numberOfLines={1}
      >
        {topLabel}
      </Text>
      <Text className={`text-[16px] font-bold ${selected ? 'text-white' : 'text-[#26242A]'}`}>
        {day}
      </Text>
      {month ? (
        <Text
          className={`text-[10px] ${selected ? 'text-[#F7EFE4]' : 'text-[#817F80]'}`}
        >
          {month}
        </Text>
      ) : (
        <View className="h-[12px]" />
      )}
    </Pressable>
  );
}
