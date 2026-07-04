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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    paddingVertical: Spacing.three,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    marginBottom: Spacing.half,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  error: {
    color: '#e5484d',
    marginTop: Spacing.three,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  chipRow: {
    marginBottom: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.four,
    marginRight: Spacing.two,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  loading: {
    marginTop: Spacing.two,
  },
  submitButton: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  standaloneButton: {
    marginTop: Spacing.three,
  },
  destructiveText: {
    color: '#e5484d',
  },
});
