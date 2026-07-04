import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
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
    borderColor: '#8888884D',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  error: {
    color: '#e5484d',
  },
  submitButton: {
    marginTop: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  row: {
    marginTop: Spacing.three,
  },
  rowContent: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  logoutButton: {
    marginTop: Spacing.four,
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  logoutText: {
    color: '#e5484d',
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 26,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
});
