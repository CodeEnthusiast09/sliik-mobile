import { StyleSheet } from 'react-native';

import { Spacing, ThemeColor } from '@/lib/constants';
import type { BookingStatus } from '@/interfaces/booking';

export function getStatusColor(status: BookingStatus, theme: Record<ThemeColor, string>): string {
  switch (status) {
    case 'pending':
      return theme.warning;
    case 'confirmed':
      return theme.success;
    case 'cancelled':
    case 'declined':
      return theme.danger;
    case 'completed':
    default:
      return theme.textSecondary;
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  title: {
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
});
