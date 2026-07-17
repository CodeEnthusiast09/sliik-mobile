import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Text, View } from 'react-native';
import type { z } from 'zod';

import { Button } from '@/components/button';
import { ControlledTextField } from '@/components/controlled-text-field';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField } from '@/components/text-field';
import { useRegister } from '@/hooks/services/auth/useRegister';
import type { UserRole } from '@/interfaces/auth';
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { registerFormSchema } from '@/validations/auth';

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export type SignUpFormProps = {
  role: UserRole;
  email: string;
  onChangeEmail: (email: string) => void;
};

export function SignUpForm({ role, email, onChangeEmail }: SignUpFormProps) {
  const router = useRouter();
  const registerMutation = useRegister();

  const { control, handleSubmit, setError } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    // role isn't an input on this form - it's fixed for the lifetime of the
    // mount (chosen before we get here), so it just rides along in the values.
    defaultValues: {
      fullName: '',
      email,
      password: '',
      confirmPassword: '',
      role,
      tradeType: undefined,
    },
  });

  function onValid(values: RegisterFormValues) {
    // Build the API payload explicitly - drops the form-only confirmPassword
    // and sends tradeType only for providers.
    registerMutation.mutate(
      {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role,
        tradeType: role === 'provider' ? values.tradeType : undefined,
      },
      {
        onSuccess: () => {
          // No token yet - the account is unverified. Send them to enter the
          // 6-digit code we just emailed; that step is where auth is established.
          router.push({
            pathname: '/verify-email',
            params: { email: values.email },
          });
        },
        onError: (error) => {
          setError('email', { message: getErrorMessage(error) });
          showToast(getErrorMessage(error), 'error');
        },
      },
    );
  }

  return (
    <View className="gap-4">
      <ControlledTextField
        control={control}
        name="fullName"
        leftIcon="person-outline"
        placeholder="Enter your full name"
        autoCapitalize="words"
      />

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
              // accidental signup <-> signin tab toggle.
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
        placeholder="Create a password"
        password
      />

      <ControlledTextField
        control={control}
        name="confirmPassword"
        leftIcon="lock-closed-outline"
        placeholder="Confirm your password"
        password
      />

      {role === 'provider' ? (
        <ControlledTextField
          control={control}
          name="tradeType"
          leftIcon="briefcase-outline"
          placeholder="e.g. hairdresser, barber"
          autoCapitalize="words"
        />
      ) : null}

      <View className="mt-1">
        <Button
          label={
            registerMutation.isPending ? 'Creating account…' : 'Create Account'
          }
          onPress={handleSubmit(onValid, (errors) =>
            showToast(
              firstFormError(errors) ?? 'Please check your details',
              'error',
            ),
          )}
          loading={registerMutation.isPending}
        />
      </View>

      {role === 'customer' && (
        <>
          <View className="my-2 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-[#E7E1D9]" />
            <Text className="text-[13px] text-[#8B877F]">
              or continue with
            </Text>
            <View className="h-px flex-1 bg-[#E7E1D9]" />
          </View>

          <SocialAuthButtons role={role} />
        </>
      )}
    </View>
  );
}
