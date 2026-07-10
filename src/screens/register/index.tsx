import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthTabs } from '@/components/auth-tabs';
import { Button } from '@/components/button';
import { SliikWordmark } from '@/components/sliik-wordmark';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField } from '@/components/text-field';
import { useRegister } from '@/hooks/services/auth/useRegister';
import type { UserRole } from '@/interfaces/auth';
import { getErrorMessage } from '@/lib/utils';
import { useSignupFlowStore } from '@/store/signup-flow';
import { showToast } from '@/store/toast';
import { registerSchema } from '@/validations/auth';

export function RegisterScreen() {
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: UserRole = roleParam === 'provider' ? 'provider' : 'customer';

  const rememberRole = useSignupFlowStore((state) => state.setRole);
  useEffect(() => {
    rememberRole(role);
  }, [role, rememberRole]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tradeType, setTradeType] = useState('');

  const [fullNameError, setFullNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [tradeTypeError, setTradeTypeError] = useState(false);

  const router = useRouter();
  const registerMutation = useRegister();

  function clearErrors() {
    setFullNameError(false);
    setEmailError(false);
    setPasswordError(false);
    setConfirmPasswordError(false);
    setTradeTypeError(false);
  }

  function handleSubmit() {
    if (password !== confirmPassword) {
      setPasswordError(true);
      setConfirmPasswordError(true);
      showToast('Passwords do not match', 'error');
      return;
    }

    const result = registerSchema.safeParse({
      email,
      password,
      role,
      fullName,
      tradeType: role === 'provider' ? tradeType : undefined,
    });

    if (!result.success) {
      const invalid = new Set(
        result.error.issues.map((issue) => String(issue.path[0])),
      );
      setFullNameError(invalid.has('fullName'));
      setEmailError(invalid.has('email'));
      setPasswordError(invalid.has('password'));
      setTradeTypeError(invalid.has('tradeType'));
      showToast(
        result.error.issues[0]?.message ?? 'Please check your details',
        'error',
      );
      return;
    }

    clearErrors();

    registerMutation.mutate(result.data, {
      onSuccess: () => {
        // No token yet - the account is unverified. Send them to enter the
        // 6-digit code we just emailed; that step is where auth is established.
        router.push({
          pathname: '/verify-email',
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
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="absolute left-4 top-2 z-10 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={26} color="#4B2E46" />
        </Pressable>

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerClassName="grow justify-center px-6 py-6"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <SliikWordmark height={38} />

            <View className="mt-5">
              <AuthTabs active="signup" />
            </View>

            <View className="mt-6 gap-4">
              <TextField
                leftIcon="person-outline"
                placeholder="Enter your full name"
                value={fullName}
                error={fullNameError}
                onChangeText={(text) => {
                  setFullName(text);
                  if (fullNameError) setFullNameError(false);
                }}
                autoCapitalize="words"
              />

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
                placeholder="Create a password"
                value={password}
                error={passwordError}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(false);
                }}
                password
              />

              <TextField
                leftIcon="lock-closed-outline"
                placeholder="Confirm your password"
                value={confirmPassword}
                error={confirmPasswordError}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError(false);
                }}
                password
              />

              {role === 'provider' ? (
                <TextField
                  leftIcon="briefcase-outline"
                  placeholder="e.g. hairdresser, barber"
                  value={tradeType}
                  error={tradeTypeError}
                  onChangeText={(text) => {
                    setTradeType(text);
                    if (tradeTypeError) setTradeTypeError(false);
                  }}
                  autoCapitalize="words"
                />
              ) : null}

              <View className="mt-1">
                <Button
                  label={
                    registerMutation.isPending
                      ? 'Creating account…'
                      : 'Create Account'
                  }
                  onPress={handleSubmit}
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
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
