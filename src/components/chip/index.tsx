import { Pressable, Text } from 'react-native';

export type ChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full border px-4 py-2.5 ${
        selected ? 'border-[#4B2E46] bg-[#4B2E46]' : 'border-[#DCD6C8] bg-white'
      }`}
    >
      <Text
        className={`text-[13px] font-bold ${selected ? 'text-white' : 'text-[#26242A]'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
