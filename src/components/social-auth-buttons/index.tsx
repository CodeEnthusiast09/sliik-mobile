import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';

import { Button } from '@/components/button';
import { useGoogleSignIn } from '@/hooks/common/use-google-signin';
import { useGoogleAuth } from '@/hooks/services/auth';
import { showToast } from '@/store/toast';

import { GoogleIcon } from './google-icon';

export function SocialAuthButtons() {
  const googleAuthMutation = useGoogleAuth();
  const { request, promptAsync } = useGoogleSignIn((idToken) =>
    googleAuthMutation.mutate(
      { idToken, role: 'customer' },
      { onError: () => showToast('Google sign-in failed. Try again.') },
    ),
  );

  const googleLoading = googleAuthMutation.isPending;

  return (
    <View className="gap-3">
      <Button
        variant="social"
        label="Continue with Google"
        leftIcon={<GoogleIcon size={18} />}
        loading={googleLoading}
        disabled={!request || googleLoading}
        onPress={() => {
          void promptAsync();
        }}
      />
      {!request ? (
        <Text className="-mt-1 text-center text-[12px] text-[#817F80]">
          Google sign-in requires a development build on this device.
        </Text>
      ) : null}
      <Button
        variant="social"
        label="Continue with Apple"
        leftIcon={<Ionicons name="logo-apple" size={18} color="#000000" />}
        disabled
        onPress={() => showToast('Apple sign-in is coming soon')}
      />
      <Text className="-mt-1 text-center text-[12px] text-[#817F80]">
        Apple sign-in is coming soon.
      </Text>
    </View>
  );
}
