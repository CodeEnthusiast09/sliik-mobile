import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { useGoogleSignIn } from '@/hooks/common/use-google-signin';
import { useGoogleAuth } from '@/hooks/services/auth';
import type { UserRole } from '@/interfaces/auth';
import { showToast } from '@/store/toast';

import { GoogleIcon } from './google-icon';

export function SocialAuthButtons({ role }: { role: UserRole }) {
  const googleAuthMutation = useGoogleAuth();
  const { request, promptAsync } = useGoogleSignIn((idToken) =>
    googleAuthMutation.mutate(
      { idToken, role },
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
      <Button
        variant="social"
        label="Continue with Apple"
        leftIcon={<Ionicons name="logo-apple" size={18} color="#000000" />}
        onPress={() => showToast('Apple sign-in is coming soon')}
      />
    </View>
  );
}
