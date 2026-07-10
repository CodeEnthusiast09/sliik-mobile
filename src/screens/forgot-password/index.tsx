import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { TextField } from '@/components/text-field';
import { useForgotPassword } from '@/hooks/services/auth/useForgotPassword';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { forgotPasswordSchema } from '@/validations/auth';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);

  const router = useRouter();
  const mutation = useForgotPassword();

  function handleSubmit() {
    const result = forgotPasswordSchema.safeParse({ email });

    if (!result.success) {
      setEmailError(true);
      showToast(
        result.error.issues[0]?.message ?? 'Enter a valid email address',
        'error',
      );
      return;
    }

    setEmailError(false);

    mutation.mutate(result.data, {
      onSuccess: () => {
        router.push({
          pathname: '/reset-password',
          params: { email: result.data.email },
        });
      },
      onError: (error) => {
        setEmailError(true);
        showToast(getErrorMessage(error), 'error');
      },
    });
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
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

              <View className="mt-1">
                <Button
                  label={mutation.isPending ? 'Sending…' : 'Send Code'}
                  onPress={handleSubmit}
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
