import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { z } from 'zod';

import { Button } from '@/components/button';
import { ControlledTextField } from '@/components/controlled-text-field';
import { TextField } from '@/components/text-field';
import { useResetPassword } from '@/hooks/services/auth/useResetPassword';
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { resetPasswordFormSchema } from '@/validations/auth';

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const router = useRouter();
  const mutation = useResetPassword();

  const { control, handleSubmit, setError } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    // email is fixed for this screen (carried in from the forgot-password step),
    // so it rides along in the values rather than being an editable field.
    defaultValues: {
      email: email ?? '',
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  function onValid(values: ResetPasswordFormValues) {
    mutation.mutate(
      {
        email: values.email,
        code: values.code,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          showToast(
            'Password reset. Sign in with your new password.',
            'success',
          );
          router.replace('/login');
        },
        onError: (error) => {
          setError('code', { message: getErrorMessage(error) });
          showToast(getErrorMessage(error), 'error');
        },
      },
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerClassName="grow px-6 pb-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              className="-ml-2 mt-1 h-10 w-10 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={26} color="#4B2E46" />
            </Pressable>

            <Text className="mt-8 text-center font-serif-regular text-[32px] leading-[38px] text-[#4B2E46]">
              Reset Password
            </Text>
            <Text className="mt-2.5 text-center text-[15px] leading-[21px] text-[#817F80]">
              Enter the 6-digit code we sent to {email ?? 'your email'} and choose
              a new password.
            </Text>

            <View className="mt-9 gap-4">
              <Controller
                control={control}
                name="code"
                render={({ field, fieldState }) => (
                  <TextField
                    leftIcon="keypad-outline"
                    placeholder="6-digit code"
                    value={field.value}
                    error={!!fieldState.error}
                    onChangeText={(text) =>
                      field.onChange(text.replace(/\D/g, ''))
                    }
                    onBlur={field.onBlur}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                )}
              />

              <ControlledTextField
                control={control}
                name="newPassword"
                leftIcon="lock-closed-outline"
                placeholder="New password"
                password
              />

              <ControlledTextField
                control={control}
                name="confirmPassword"
                leftIcon="lock-closed-outline"
                placeholder="Confirm new password"
                password
              />

              <View className="mt-1">
                <Button
                  label={mutation.isPending ? 'Resetting…' : 'Reset Password'}
                  onPress={handleSubmit(onValid, (errors) =>
                    showToast(
                      firstFormError(errors) ?? 'Please check your details',
                      'error',
                    ),
                  )}
                  loading={mutation.isPending}
                />
              </View>
            </View>

            <View className="mt-auto flex-row justify-center pt-8">
              <Text className="text-[14px] text-[#817F80]">
                Didn&apos;t get a code?{' '}
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text className="text-[14px] font-bold text-[#4B2E46]">
                  Resend
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
