import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { UserRole } from '@/interfaces/auth';

import { styles } from './index.styles';

export function OnboardingScreen() {
  const router = useRouter();

  function selectRole(role: UserRole) {
    router.push({ pathname: '/register', params: { role } });
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Sliik</ThemedText>
        <ThemedText type="default" style={styles.subtitle} themeColor="textSecondary">
          Book trusted beauty and grooming pros, or grow your client base.
        </ThemedText>

        <Pressable onPress={() => selectRole('customer')}>
          <ThemedView type="backgroundElement" style={styles.optionButton}>
            <ThemedText type="smallBold">I&apos;m looking for services</ThemedText>
          </ThemedView>
        </Pressable>

        <Pressable onPress={() => selectRole('provider')}>
          <ThemedView type="backgroundElement" style={styles.optionButton}>
            <ThemedText type="smallBold">I offer services</ThemedText>
          </ThemedView>
        </Pressable>

        <Pressable onPress={() => router.push('/login')} style={styles.linkButton}>
          <ThemedText type="link">Already have an account? Log in</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
