import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';
import { TextField } from '@/components/text-field';
import { useRegister } from '@/hooks/services/auth/useRegister';
import type { UserRole } from '@/interfaces/auth';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { registerSchema } from '@/validations/auth';

export type SignUpFormProps = {
  role: UserRole;
  email: string;
  onChangeEmail: (email: string) => void;
};

export function SignUpForm({ role, email, onChangeEmail }: SignUpFormProps) {
  const [fullName, setFullName] = useState('');
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
    <View className="gap-4">
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
          onChangeEmail(text);
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
            registerMutation.isPending ? 'Creating account…' : 'Create Account'
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
  );
}
