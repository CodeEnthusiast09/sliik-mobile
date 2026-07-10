import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { ReviewsList } from '@/components/reviews-list';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { usePayoutAccount } from '@/hooks/services/payouts';
import {
  useProviderProfile,
  useUpdateProviderProfile,
} from '@/hooks/services/provider';
import { useReviewsForUser } from '@/hooks/services/reviews';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';
import { unregisterPushToken } from '@/services/notifications';
import { useAuthStore } from '@/store/auth';
import { usePushTokenStore } from '@/store/push-token';
import { updateProviderProfileSchema } from '@/validations/provider-profile';

export function ProviderProfileScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const {
    data: profile,
    isLoading,
    isError,
    error: profileError,
    refetch,
  } = useProviderProfile();
  const { data: payoutAccount } = usePayoutAccount();
  const updateProfileMutation = useUpdateProviderProfile();
  const uploadImageMutation = useUploadImage();
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(
    profile?.userId,
  );

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [city, setCity] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [syncedProfileId, setSyncedProfileId] = useState<string | null>(null);

  if (profile && profile.id !== syncedProfileId) {
    setSyncedProfileId(profile.id);
    setFullName(profile.fullName ?? '');
    setPhone(profile.phone ?? '');
    setBio(profile.bio ?? '');
    setTradeType(profile.tradeType ?? '');
    setYearsExperience(
      profile.yearsExperience != null ? String(profile.yearsExperience) : '',
    );
    setCity(profile.city ?? '');
  }

  async function handlePickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uploadResponse = await uploadImageMutation.mutateAsync(
      result.assets[0],
    );
    if (uploadResponse.data) {
      updateProfileMutation.mutate({ avatarUrl: uploadResponse.data.url });
    }
  }

  function handleSave() {
    setFieldError(null);

    const result = updateProviderProfileSchema.safeParse({
      fullName,
      phone: phone || undefined,
      bio: bio || undefined,
      tradeType,
      yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
      city: city || undefined,
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    updateProfileMutation.mutate(result.data);
  }

  const serverError = updateProfileMutation.isError
    ? getErrorMessage(updateProfileMutation.error)
    : null;

  async function handleLogout() {
    const pushToken = usePushTokenStore.getState().token;
    if (pushToken) {
      await unregisterPushToken(pushToken).catch(() => {});
    }
    clearAuth();
    router.replace('/login');
  }

  if (isError) {
    return (
      <View className="flex-1 bg-[#FBF8F3]">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState
              message={getErrorMessage(profileError)}
              onRetry={refetch}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#FBF8F3]">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref="/profile/notifications" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32"
          >
            <Text className="mt-4 font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
              Profile
            </Text>

            <Pressable onPress={handlePickAvatar} className="self-center">
              <View className="my-5 h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#F3F0EB]">
                {profile?.avatarUrl ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    style={{ width: 96, height: 96 }}
                    contentFit="cover"
                  />
                ) : (
                  <Text className="text-[13px] text-[#817F80]">
                    Add photo
                  </Text>
                )}
              </View>
            </Pressable>

            <TextInput
              placeholder="Full name"
              placeholderTextColor="#A8A39B"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              className="rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Phone"
              placeholderTextColor="#A8A39B"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Trade (e.g. hairdresser, barber)"
              placeholderTextColor="#A8A39B"
              value={tradeType}
              onChangeText={setTradeType}
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Years of experience"
              placeholderTextColor="#A8A39B"
              value={yearsExperience}
              onChangeText={setYearsExperience}
              keyboardType="number-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="City"
              placeholderTextColor="#A8A39B"
              value={city}
              onChangeText={setCity}
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Bio"
              placeholderTextColor="#A8A39B"
              value={bio}
              onChangeText={setBio}
              multiline
              className="mt-3 min-h-[80px] rounded-[16px] border border-[#ECE7E0] bg-white px-5 py-4 text-[15px] text-[#26242A]"
              style={{ textAlignVertical: 'top', outlineWidth: 0 }}
            />

            {(fieldError ?? serverError) ? (
              <Text className="mt-3 text-[13px] text-[#E5484D]">
                {fieldError ?? serverError}
              </Text>
            ) : null}

            <View className="mt-4">
              <Button
                label={
                  updateProfileMutation.isPending ? 'Saving…' : 'Save changes'
                }
                onPress={handleSave}
                loading={updateProfileMutation.isPending}
              />
            </View>

            <Pressable
              onPress={() => router.push('/profile/payout')}
              className="mt-4 gap-0.5 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
            >
              <Text className="font-serif-bold text-[15px] text-[#26242A]">
                Payout details
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                {payoutAccount ? payoutAccount.accountName : 'Not set up'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/services')}
              className="mt-3 gap-0.5 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
            >
              <Text className="font-serif-bold text-[15px] text-[#26242A]">
                Services
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                Manage what you offer
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/availability')}
              className="mt-3 gap-0.5 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
            >
              <Text className="font-serif-bold text-[15px] text-[#26242A]">
                Availability
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                Set your weekly schedule
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/portfolio')}
              className="mt-3 gap-0.5 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
            >
              <Text className="font-serif-bold text-[15px] text-[#26242A]">
                Portfolio
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                Showcase your best work
              </Text>
            </Pressable>

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Reviews received
            </Text>
            <View className="mt-3">
              <ReviewsList
                averageRating={userReviews?.averageRating ?? null}
                totalReviews={userReviews?.totalReviews ?? 0}
                reviews={userReviews?.reviews ?? []}
                isLoading={isLoadingReviews}
              />
            </View>

            <Pressable onPress={handleLogout} className="mt-6 items-center py-2">
              <Text className="text-[14px] font-bold text-[#E5484D]">
                Log out
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/delete-account')}
              className="mt-1 items-center py-2"
            >
              <Text className="text-[13px] text-[#817F80]">Delete account</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
