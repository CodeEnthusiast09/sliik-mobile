import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';
import type { BookingStatus } from '@/interfaces/booking';

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: '#e0a800',
  confirmed: '#2f9e44',
  completed: '#60646C',
  cancelled: '#e5484d',
  declined: '#e5484d',
};

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
  loading: {
    marginTop: Spacing.four,
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
