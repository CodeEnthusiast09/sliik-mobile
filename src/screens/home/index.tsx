import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuthStore } from '@/store/auth';

import { styles } from './index.styles';

export function HomeScreen() {
  const role = useAuthStore((state) => state.role);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Sliik</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          Logged in as {role}
        </ThemedText>

        <Pressable onPress={() => clearAuth()}>
          <ThemedView type="backgroundElement" style={styles.logoutButton}>
            <ThemedText type="smallBold">Log out</ThemedText>
          </ThemedView>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
