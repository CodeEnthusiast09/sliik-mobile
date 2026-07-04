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
    marginBottom: Spacing.half,
  },
  card: {
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  error: {
    marginTop: Spacing.three,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  actionButton: {
    flex: 1,
  },
  submitButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  standaloneButton: {
    marginTop: Spacing.four,
  },
  reviewSection: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  starRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  star: {
    fontSize: 28,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
