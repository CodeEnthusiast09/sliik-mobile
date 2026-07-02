import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRegister } from '@/hooks/services/auth/useRegister';
import type { UserRole } from '@/interfaces/auth';
import { getErrorMessage } from '@/lib/utils';
import { registerSchema } from '@/validations/auth';

import { styles } from './index.styles';

export function RegisterScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: UserRole = roleParam === 'provider' ? 'provider' : 'customer';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const router = useRouter();
  const registerMutation = useRegister();

  function handleSubmit() {
    setFieldError(null);

    const result = registerSchema.safeParse({
      email,
      password,
      role,
      fullName,
      tradeType: role === 'provider' ? tradeType : undefined,
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    registerMutation.mutate(result.data, {
      onSuccess: () => router.replace('/'),
    });
  }

  const serverError = registerMutation.isError ? getErrorMessage(registerMutation.error) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          {role === 'provider' ? 'Set up your provider account' : 'Create your account'}
        </ThemedText>

        <TextInput
          placeholder="Full name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        {role === 'provider' && (
          <TextInput
            placeholder="Trade (e.g. hairdresser, barber)"
            value={tradeType}
            onChangeText={setTradeType}
            style={styles.input}
          />
        )}

        {(fieldError ?? serverError) && (
          <ThemedText type="small" style={styles.error}>
            {fieldError ?? serverError}
          </ThemedText>
        )}

        <Pressable onPress={handleSubmit} disabled={registerMutation.isPending}>
          <ThemedView type="backgroundElement" style={styles.submitButton}>
            <ThemedText type="smallBold">
              {registerMutation.isPending ? 'Creating account...' : 'Create account'}
            </ThemedText>
          </ThemedView>
        </Pressable>

        <Pressable onPress={() => router.push('/login')} style={styles.linkButton}>
          <ThemedText type="link">Already have an account? Log in</ThemedText>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
