import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 140,
    gap: Spacing.two,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: Spacing.three,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 96,
    height: 96,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  submitButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  logoutButton: {
    marginTop: Spacing.four,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
});
