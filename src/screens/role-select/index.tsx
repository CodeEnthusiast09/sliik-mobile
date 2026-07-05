import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { SliikWordmark } from '@/components/sliik-wordmark';
import type { UserRole } from '@/interfaces/auth';
import { useSignupFlowStore } from '@/store/signup-flow';

const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

const CUTOUT_WIDTH = 132;

type RoleCardProps = {
  title: string;
  tag: string;
  description: string;
  image: number;
  /** Source image width / height, used so the cutout keeps its true proportions while floating above the card. */
  aspectRatio: number;
  selected: boolean;
  onPress: () => void;
};

function RoleCard({
  title,
  tag,
  description,
  image,
  aspectRatio,
  selected,
  onPress,
}: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={CARD_SHADOW}
      className={`relative rounded-[20px] ${
        selected
          ? 'border-2 border-[#4B2E46] bg-[#F6EEF3]'
          : 'border border-[#ECE7E0] bg-white'
      }`}
    >
      <View
        className="justify-center gap-2 py-5 pl-5"
        style={{ paddingRight: CUTOUT_WIDTH + 10 }}
      >
        <View className="self-start rounded-full bg-[#F0E6EC] px-2.5 py-1">
          <Text className="text-[11px] font-medium text-[#4B2E46]">{tag}</Text>
        </View>
        <Text className="font-serif-regular text-[20px] leading-[25px] text-[#26242A]">
          I&apos;m a{'\n'}
          <Text className="font-serif-bold text-[#4B2E46]">{title}</Text>
        </Text>
        <Text className="text-[13px] leading-[18px] text-[#817F80]">
          {description}
        </Text>
      </View>

      <Image
        source={image}
        contentFit="contain"
        style={{
          position: 'absolute',
          right: 6,
          bottom: 0,
          width: CUTOUT_WIDTH,
          height: CUTOUT_WIDTH / aspectRatio,
        }}
      />
    </Pressable>
  );
}

export function RoleSelectScreen() {
  const [role, setRole] = useState<UserRole | null>(null);
  const router = useRouter();
  const rememberRole = useSignupFlowStore((state) => state.setRole);

  function handleContinue() {
    if (!role) return;
    rememberRole(role);
    router.push({ pathname: '/register', params: { role } });
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <StatusBar style="dark" />

      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="absolute left-4 top-2 z-10 h-10 w-10 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={26} color="#4B2E46" />
        </Pressable>

        <ScrollView
          contentContainerClassName="grow justify-center px-6 py-6"
          showsVerticalScrollIndicator={false}
        >
          <SliikWordmark height={30} />

          <Text className="mt-6 font-serif-bold text-[26px] leading-[32px] text-[#26242A]">
            Who are you?
          </Text>
          <Text className="mt-2 text-[14px] leading-[20px] text-[#817F80]">
            This helps us personalize your experience and show you what matters
            most.
          </Text>

          <View className="mt-6 gap-4">
            <RoleCard
              title="Customer"
              tag="Book services"
              description="Book services, discover professionals or post an offer for providers to bid on."
              image={require('../../../assets/images/role-select-customer.png')}
              aspectRatio={360 / 567}
              selected={role === 'customer'}
              onPress={() => setRole('customer')}
            />
            <RoleCard
              title="Provider"
              tag="Earn on Sliik"
              description="Offer your services, manage bookings and grow your business."
              image={require('../../../assets/images/role-select-provider.png')}
              aspectRatio={360 / 527}
              selected={role === 'provider'}
              onPress={() => setRole('provider')}
            />
          </View>

          <View className="mt-10">
            <Button
              label="Continue"
              onPress={handleContinue}
              disabled={!role}
            />

            <View className="mt-3 flex-row justify-center">
              <Text className="text-[14px] text-[#817F80]">
                Already have an account?{' '}
              </Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text className="text-[14px] font-bold text-[#4B2E46]">
                  Sign in
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
