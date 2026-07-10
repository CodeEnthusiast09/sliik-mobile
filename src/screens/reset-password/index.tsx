import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { useResetPassword } from '@/hooks/services/auth/useResetPassword';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { resetPasswordFormSchema } from '@/validations/auth';

export function ResetPasswordScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();

  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  const router = useRouter();
  const mutation = useResetPassword();

  function handleSubmit() {
    const result = resetPasswordFormSchema.safeParse({
      email: email ?? '',
      code,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      const invalid = new Set(
        result.error.issues.map((issue) => String(issue.path[0])),
      );
      setCodeError(invalid.has('code'));
      setPasswordError(invalid.has('newPassword'));
      setConfirmError(invalid.has('confirmPassword'));
      showToast(
        result.error.issues[0]?.message ?? 'Please check your details',
        'error',
      );
      return;
    }

    setCodeError(false);
    setPasswordError(false);
    setConfirmError(false);

    const { confirmPassword: _confirm, ...payload } = result.data;
    mutation.mutate(payload, {
      onSuccess: () => {
        showToast('Password reset. Sign in with your new password.', 'success');
        router.replace('/login');
      },
      onError: (error) => {
        setCodeError(true);
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
              Reset Password
            </Text>
            <Text className="mt-2.5 text-center text-[15px] leading-[21px] text-[#817F80]">
              Enter the 6-digit code we sent to {email ?? 'your email'} and choose
              a new password.
            </Text>

            <View className="mt-9 gap-4">
              <TextField
                leftIcon="keypad-outline"
                placeholder="6-digit code"
                value={code}
                error={codeError}
                onChangeText={(text) => {
                  setCode(text.replace(/\D/g, ''));
                  if (codeError) setCodeError(false);
                }}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
              />

              <TextField
                leftIcon="lock-closed-outline"
                placeholder="New password"
                value={newPassword}
                error={passwordError}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (passwordError) setPasswordError(false);
                }}
                password
              />

              <TextField
                leftIcon="lock-closed-outline"
                placeholder="Confirm new password"
                value={confirmPassword}
                error={confirmError}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmError) setConfirmError(false);
                }}
                password
              />

              <View className="mt-1">
                <Button
                  label={mutation.isPending ? 'Resetting…' : 'Reset Password'}
                  onPress={handleSubmit}
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
