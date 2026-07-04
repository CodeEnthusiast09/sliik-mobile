import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="danger" style={styles.text}>
        {message}
      </ThemedText>
      {onRetry && (
        <Pressable onPress={onRetry}>
          <ThemedText type="linkPrimary">Retry</ThemedText>
        </Pressable>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
    gap: Spacing.two,
  },
  text: {
    textAlign: 'center',
  },
});
