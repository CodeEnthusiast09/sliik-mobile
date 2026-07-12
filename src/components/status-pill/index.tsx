import { Text, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/common/use-theme';
import type { BookingStatus } from '@/interfaces/booking';
import type { OfferStatus } from '@/interfaces/offer';
import { getStatusColor } from '@/lib/utils';

export type StatusPillProps = {
  status: BookingStatus | OfferStatus;
};

export function StatusPill({ status }: StatusPillProps) {
  const theme = useTheme();
  const color = getStatusColor(status, theme);

  const containerStyle: ViewStyle = {
    backgroundColor: `${color}1F`,
    borderColor: color,
    borderWidth: 1,
  };

  return (
    <View
      style={containerStyle}
      className="self-start rounded-xl px-2 py-1.5"
    >
      <Text style={{ color }} className="text-[12px] font-semibold">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  );
}
