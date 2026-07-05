import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthTabs } from '@/components/auth-tabs';
import { Button } from '@/components/button';
import { SliikWordmark } from '@/components/sliik-wordmark';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField } from '@/components/text-field';
import { useLogin } from '@/hooks/services/auth/useLogin';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { loginSchema } from '@/validations/auth';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const router = useRouter();
  const loginMutation = useLogin();

  function handleSubmit() {
    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const invalid = new Set(
        result.error.issues.map((issue) => String(issue.path[0])),
      );
      setEmailError(invalid.has('email'));
      setPasswordError(invalid.has('password'));
      showToast(
        result.error.issues[0]?.message ?? 'Please check your details',
        'error',
      );
      return;
    }

    setEmailError(false);
    setPasswordError(false);

    loginMutation.mutate(result.data, {
      onSuccess: () => router.replace('/'),
      onError: (error) => {
        setEmailError(true);
        setPasswordError(true);
        showToast(getErrorMessage(error), 'error');
      },
    });
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="absolute left-4 top-2 z-10 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={26} color="#4B2E46" />
        </Pressable>

        <KeyboardAvoidingView
          className="flex-1 justify-center px-6"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <SliikWordmark height={38} />

          <View className="mt-5">
            <AuthTabs active="signin" />
          </View>

          <View className="mt-8 gap-4">
            <TextField
              leftIcon="mail-outline"
              placeholder="Enter your email"
              value={email}
              error={emailError}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError(false);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <TextField
              leftIcon="lock-closed-outline"
              placeholder="Enter your password"
              value={password}
              error={passwordError}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(false);
              }}
              password
            />

            <Pressable
              onPress={() => router.push('/forgot-password')}
              className="self-end"
            >
              <Text className="text-[14px] font-bold text-[#4B2E46]">
                Forgot password?
              </Text>
            </Pressable>

            <View className="mt-1">
              <Button
                label={loginMutation.isPending ? 'Signing in…' : 'Sign In'}
                onPress={handleSubmit}
                loading={loginMutation.isPending}
              />
            </View>

            <View className="my-2 flex-row items-center gap-3">
              <View className="h-px flex-1 bg-[#E7E1D9]" />
              <Text className="text-[13px] text-[#8B877F]">
                or continue with
              </Text>
              <View className="h-px flex-1 bg-[#E7E1D9]" />
            </View>

            <SocialAuthButtons />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
