import { StyleSheet } from 'react-native';

import { Spacing } from '@/lib/constants';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="small" themeColor="textSecondary" style={styles.text}>
        {message}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.six,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
  },
});
