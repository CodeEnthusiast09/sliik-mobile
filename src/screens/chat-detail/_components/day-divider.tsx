import { Text, View } from 'react-native';

import { formatChatDayDivider } from '@/lib/utils';

export function DayDivider({ isoDateTime }: { isoDateTime: string }) {
  return (
    <View className="items-center py-2">
      <Text className="text-[12px] font-medium text-[#948F86]">
        {formatChatDayDivider(isoDateTime)}
      </Text>
    </View>
  );
}
