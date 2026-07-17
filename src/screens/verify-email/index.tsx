import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { TextField } from '@/components/text-field';
import { useResendVerification } from '@/hooks/services/auth/useResendVerification';
import { useVerifyEmail } from '@/hooks/services/auth/useVerifyEmail';
import { RESEND_COOLDOWN_SECONDS } from '@/lib/constants';
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { verifyEmailSchema } from '@/validations/auth';

type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;

export function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [cooldown, setCooldown] = useState(0);

  const router = useRouter();
  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const { control, handleSubmit, setError } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    // email is fixed (carried in via param); only the code is editable.
    defaultValues: { email: email ?? '', code: '' },
  });

  // Tick the resend cooldown down to zero. Starts only after a resend tap (not
  // on mount), so someone arriving here from an expired code can resend at once.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function onValid(data: VerifyEmailValues) {
    verifyMutation.mutate(data, {
      onSuccess: () => {
        showToast('Email verified. Welcome to Sliik.', 'success');
        router.replace('/');
      },
      onError: (error) => {
        setError('code', { message: getErrorMessage(error) });
        showToast(getErrorMessage(error), 'error');
      },
    });
  }

  function handleResend() {
    if (cooldown > 0 || resendMutation.isPending || !email) return;

    resendMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setCooldown(RESEND_COOLDOWN_SECONDS);
          showToast('If your account needs it, a new code is on the way.', 'success');
        },
        onError: (error) => showToast(getErrorMessage(error), 'error'),
      },
    );
  }

  const resendDisabled = cooldown > 0 || resendMutation.isPending;

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
              Verify Email
            </Text>
            <Text className="mt-2.5 text-center text-[15px] leading-[21px] text-[#817F80]">
              Enter the 6-digit code we sent to {email ?? 'your email'} to finish
              setting up your account.
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

              <View className="mt-1">
                <Button
                  label={verifyMutation.isPending ? 'Verifying…' : 'Verify Email'}
                  onPress={handleSubmit(onValid, (errors) =>
                    showToast(
                      firstFormError(errors) ?? 'Enter the 6-digit code',
                      'error',
                    ),
                  )}
                  loading={verifyMutation.isPending}
                />
              </View>
            </View>

            <View className="mt-auto flex-row justify-center pt-8">
              <Text className="text-[14px] text-[#817F80]">
                Didn&apos;t get a code?{' '}
              </Text>
              <Pressable onPress={handleResend} disabled={resendDisabled}>
                <Text
                  className={
                    resendDisabled
                      ? 'text-[14px] font-bold text-[#B7A9B2]'
                      : 'text-[14px] font-bold text-[#4B2E46]'
                  }
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
