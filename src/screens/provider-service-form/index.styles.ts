import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  backButton: {
    marginTop: Spacing.two,
  },
  title: {
    marginBottom: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderColor: '#8888884D',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  descriptionInput: {
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
  deleteText: {
    marginTop: Spacing.three,
    textAlign: 'center',
    color: '#e5484d',
  },
  reactivateText: {
    marginTop: Spacing.three,
    textAlign: 'center',
    color: '#3c87f7',
  },
});
