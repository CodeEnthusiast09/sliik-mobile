import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { Button } from '@/components/button';
import { showToast } from '@/store/toast';

import { GoogleIcon } from './google-icon';

export function SocialAuthButtons() {
  return (
    <View className="gap-3">
      <Button
        variant="social"
        label="Continue with Google"
        leftIcon={<GoogleIcon size={18} />}
        onPress={() => showToast('Google sign-in is coming soon')}
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
