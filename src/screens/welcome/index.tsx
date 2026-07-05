import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { SocialAuthButtons } from '@/components/social-auth-buttons';

export function WelcomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <Image
        source={require('../../../assets/images/onboarding-hero.jpg')}
        contentFit="cover"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['transparent', 'rgba(24,13,21,0.6)', 'rgba(15,8,13,0.96)']}
        locations={[0, 0.42, 0.72]}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 justify-end px-6 pb-6">
          <Text className="font-serif-bold text-[30px] leading-[36px] text-white">
            Book beauty & grooming, your way
          </Text>
          <Text className="mt-3 text-[14px] leading-[20px] text-white/80">
            Discover top professionals near you, or grow your business as a
            provider.
          </Text>

          <View className="mt-6 gap-3">
            <Button
              label="Continue with Email"
              leftIcon={
                <Ionicons name="mail-outline" size={18} color="#F7EFE4" />
              }
              onPress={() => router.push('/role-select')}
            />
            <SocialAuthButtons />
          </View>

          <Text className="mt-5 text-center text-[12px] leading-[17px] text-white/60">
            By continuing, you agree to our{' '}
            <Text className="underline">Terms of Service</Text> and{' '}
            <Text className="underline">Privacy Policy</Text>.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
