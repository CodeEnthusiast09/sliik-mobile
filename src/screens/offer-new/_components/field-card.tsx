import { type ReactNode } from 'react';
import { Text, View } from 'react-native';

export function FieldCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-3 gap-2 rounded-[16px] border border-[#ECE7E0] bg-white p-4">
      <Text className="text-[13px] font-bold text-[#26242A]">{label}</Text>
      {children}
    </View>
  );
}
