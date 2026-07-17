import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, Text, View } from 'react-native';
import type { z } from 'zod';

import { Button } from '@/components/button';
import { ControlledTextField } from '@/components/controlled-text-field';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField } from '@/components/text-field';
import { useLogin } from '@/hooks/services/auth/useLogin';
import {
  firstFormError,
  getErrorMessage,
  isEmailNotVerifiedError,
} from '@/lib/utils';
import { showToast } from '@/store/toast';
import { loginSchema } from '@/validations/auth';

type LoginFormValues = z.infer<typeof loginSchema>;

export type SignInFormProps = {
  email: string;
  onChangeEmail: (email: string) => void;
};

export function SignInForm({ email, onChangeEmail }: SignInFormProps) {
  const router = useRouter();
  const loginMutation = useLogin();

  const { control, handleSubmit } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email, password: '' },
  });

  function onValid(data: LoginFormValues) {
    loginMutation.mutate(data, {
      onSuccess: () => router.replace('/'),
      onError: (error) => {
        // A 403 here means the account exists and the password is right, but
        // the email was never verified - route them to the verify step instead
        // of showing a dead-end error.
        if (isEmailNotVerifiedError(error)) {
          router.push({
            pathname: '/verify-email',
            params: { email: data.email },
          });
          return;
        }
        showToast(getErrorMessage(error), 'error');
      },
    });
  }

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            leftIcon="mail-outline"
            placeholder="Enter your email"
            value={field.value}
            error={!!fieldState.error}
            onChangeText={(text) => {
              field.onChange(text);
              // Keep the parent's copy in sync so the email survives an
              // accidental signin <-> signup tab toggle.
              onChangeEmail(text);
            }}
            onBlur={field.onBlur}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        )}
      />

      <ControlledTextField
        control={control}
        name="password"
        leftIcon="lock-closed-outline"
        placeholder="Enter your password"
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
          onPress={handleSubmit(onValid, (errors) =>
            showToast(
              firstFormError(errors) ?? 'Please check your details',
              'error',
            ),
          )}
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
