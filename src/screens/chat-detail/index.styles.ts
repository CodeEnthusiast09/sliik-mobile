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
  title: {
    fontSize: 22,
    lineHeight: 28,
    marginBottom: Spacing.two,
  },
  flexOne: {
    flex: 1,
  },
  listContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  bubble: {
    maxWidth: '80%',
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.half,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
  },
  bubbleTheirs: {
    alignSelf: 'flex-start',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8888884D',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});
