import { Text, View } from 'react-native';

import { useTheme } from '@/hooks/common/use-theme';
import type { BookingStatus } from '@/interfaces/booking';
import { getStatusColor } from '@/lib/utils';

export type StatusPillProps = {
  status: BookingStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  const theme = useTheme();
  const color = getStatusColor(status, theme);

  return (
    <View
      style={{ backgroundColor: `${color}1F` }}
      className="self-start rounded-full px-3 py-1.5"
    >
      <Text style={{ color }} className="text-[13px] font-bold">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}
