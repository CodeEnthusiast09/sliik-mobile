import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
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
import { useForgotPassword } from '@/hooks/services/auth/useForgotPassword';
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { forgotPasswordSchema } from '@/validations/auth';

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordScreen() {
  const router = useRouter();
  const mutation = useForgotPassword();

  const { control, handleSubmit, setError } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  function onValid(data: ForgotPasswordValues) {
    mutation.mutate(data, {
      onSuccess: () => {
        router.push({
          pathname: '/reset-password',
          params: { email: data.email },
        });
      },
      onError: (error) => {
        setError('email', { message: getErrorMessage(error) });
        showToast(getErrorMessage(error), 'error');
      },
    });
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
              Forgot Password?
            </Text>
            <Text className="mt-2.5 text-center text-[15px] leading-[21px] text-[#817F80]">
              Enter your email and we&apos;ll send you a 6-digit code to reset
              your password.
            </Text>

            <View className="mt-9 gap-4">
              <ControlledTextField
                control={control}
                name="email"
                leftIcon="mail-outline"
                placeholder="Enter your email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />

              <View className="mt-1">
                <Button
                  label={mutation.isPending ? 'Sending…' : 'Send Code'}
                  onPress={handleSubmit(onValid, (errors) =>
                    showToast(
                      firstFormError(errors) ?? 'Enter a valid email address',
                      'error',
                    ),
                  )}
                  loading={mutation.isPending}
                />
              </View>
            </View>

            <View className="mt-auto flex-row justify-center pt-8">
              <Text className="text-[14px] text-[#817F80]">
                Remember your password?{' '}
              </Text>
              <Pressable onPress={() => router.back()}>
                <Text className="text-[14px] font-bold text-[#4B2E46]">
                  Sign in
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
