import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  summary: {
    marginBottom: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
    marginBottom: Spacing.two,
  },
});
