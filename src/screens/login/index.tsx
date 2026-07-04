import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useLogin } from '@/hooks/services/auth/useLogin';
import { getErrorMessage } from '@/lib/utils';
import { loginSchema } from '@/validations/auth';

import { styles } from './index.styles';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const router = useRouter();
  const loginMutation = useLogin();

  function handleSubmit() {
    setFieldError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    loginMutation.mutate(result.data, {
      onSuccess: () => router.replace('/'),
    });
  }

  const serverError = loginMutation.isError ? getErrorMessage(loginMutation.error) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Welcome back
        </ThemedText>

        <ThemedTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <ThemedTextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        {(fieldError ?? serverError) && (
          <ThemedText type="small" themeColor="danger">
            {fieldError ?? serverError}
          </ThemedText>
        )}

        <Pressable onPress={handleSubmit} disabled={loginMutation.isPending}>
          <ThemedView type="backgroundElement" style={styles.submitButton}>
            <ThemedText type="smallBold">
              {loginMutation.isPending ? 'Logging in...' : 'Log in'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
