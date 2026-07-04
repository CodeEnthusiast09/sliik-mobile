import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  backButton: {
    paddingVertical: Spacing.three,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    marginBottom: Spacing.two,
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
