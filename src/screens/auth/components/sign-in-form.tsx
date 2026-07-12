import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField } from '@/components/text-field';
import { useLogin } from '@/hooks/services/auth/useLogin';
import { getErrorMessage, isEmailNotVerifiedError } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { loginSchema } from '@/validations/auth';

export type SignInFormProps = {
  email: string;
  onChangeEmail: (email: string) => void;
};

export function SignInForm({ email, onChangeEmail }: SignInFormProps) {
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
        // A 403 here means the account exists and the password is right, but
        // the email was never verified - route them to the verify step instead
        // of showing a dead-end error.
        if (isEmailNotVerifiedError(error)) {
          router.push({
            pathname: '/verify-email',
            params: { email: result.data.email },
          });
          return;
        }
        setEmailError(true);
        setPasswordError(true);
        showToast(getErrorMessage(error), 'error');
      },
    });
  }

  return (
    <View className="gap-4">
      <TextField
        leftIcon="mail-outline"
        placeholder="Enter your email"
        value={email}
        error={emailError}
        onChangeText={(text) => {
          onChangeEmail(text);
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
        <Text className="text-[13px] text-[#8B877F]">or continue with</Text>
        <View className="h-px flex-1 bg-[#E7E1D9]" />
      </View>

      <SocialAuthButtons role="customer" />
    </View>
  );
}
