import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useUnreadCount } from '@/hooks/services/notifications';

import { styles } from './index.styles';

interface NotificationBellProps {
  onPress: () => void;
}

export function NotificationBell({ onPress }: NotificationBellProps) {
  const { data: unreadCount } = useUnreadCount();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ThemedText style={styles.bell}>🔔</ThemedText>
      {!!unreadCount && (
        <ThemedView type="danger" style={styles.badge}>
          <ThemedText style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</ThemedText>
        </ThemedView>
      )}
    </Pressable>
  );
}
