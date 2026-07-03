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
    gap: Spacing.two,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingBottom: Spacing.three,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  avatarImage: {
    width: 96,
    height: 96,
  },
  name: {
    fontSize: 28,
    lineHeight: 32,
  },
  bio: {
    paddingVertical: Spacing.two,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.three,
    marginBottom: Spacing.two,
  },
  serviceRow: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
    marginBottom: Spacing.two,
  },
  gridRow: {
    gap: Spacing.two,
  },
  gridItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
    marginBottom: Spacing.two,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});
