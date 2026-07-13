import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { ReviewsList } from '@/components/reviews-list';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '@/hooks/services/customer';
import { useReviewsForUser } from '@/hooks/services/reviews';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';
import { unregisterPushToken } from '@/services/notifications';
import { useAuthStore } from '@/store/auth';
import { usePushTokenStore } from '@/store/push-token';
import { updateCustomerProfileSchema } from '@/validations/customer-profile';

export function CustomerAccountScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const {
    data: profile,
    isLoading,
    isError,
    error: profileError,
    refetch,
  } = useCustomerProfile();
  const updateProfileMutation = useUpdateCustomerProfile();
  const uploadImageMutation = useUploadImage();
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(
    profile?.userId,
  );

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [syncedProfileId, setSyncedProfileId] = useState<string | null>(null);
  const fullNameInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const cityInputRef = useRef<TextInput>(null);

  if (profile && profile.id !== syncedProfileId) {
    setSyncedProfileId(profile.id);
    setFullName(profile.fullName ?? '');
    setPhone(profile.phone ?? '');
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

  const isDirty =
    !!profile &&
    (fullName !== (profile.fullName ?? '') ||
      phone !== (profile.phone ?? '') ||
      city !== (profile.city ?? ''));

  function handleSave() {
    setFieldError(null);

    const result = updateCustomerProfileSchema.safeParse({
      fullName,
      phone: phone || undefined,
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
      <View className="flex-1 bg-white">
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
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader title="Account" notificationsHref="/home/notifications" />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32"
          >
            <Pressable
              onPress={handlePickAvatar}
              className="mt-5 h-24 w-24 self-center"
            >
              <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-[#F3F0EB]">
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
              <View className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#4B2E46]">
                <Ionicons name="camera" size={14} color="#F7EFE4" />
              </View>
            </Pressable>

            <Text className="mt-3 text-center font-serif-bold text-[20px] text-[#26242A]">
              {profile?.fullName}
            </Text>
            <Text className="text-center text-[13px] text-[#817F80]">
              Customer
            </Text>

            <View className="mt-6 rounded-[20px] border border-[#ECE7E0] bg-white">
              <View className="flex-row items-center gap-3 px-4 py-3.5">
                <View className="flex-1">
                  <Text className="text-[12px] text-[#948F86]">
                    Full name
                  </Text>
                  <TextInput
                    ref={fullNameInputRef}
                    placeholder="Full name"
                    placeholderTextColor="#A8A39B"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    className="mt-0.5 text-[15px] text-[#26242A]"
                    style={{ outlineWidth: 0, padding: 0 }}
                  />
                </View>
                <Pressable
                  onPress={() => fullNameInputRef.current?.focus()}
                  hitSlop={10}
                >
                  <Ionicons name="create-outline" size={16} color="#948F86" />
                </Pressable>
              </View>
              <View className="h-px bg-[#ECE7E0]" />
              <View className="flex-row items-center gap-3 px-4 py-3.5">
                <View className="flex-1">
                  <Text className="text-[12px] text-[#948F86]">
                    Phone number
                  </Text>
                  <TextInput
                    ref={phoneInputRef}
                    placeholder="Phone number"
                    placeholderTextColor="#A8A39B"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    className="mt-0.5 text-[15px] text-[#26242A]"
                    style={{ outlineWidth: 0, padding: 0 }}
                  />
                </View>
                <Pressable
                  onPress={() => phoneInputRef.current?.focus()}
                  hitSlop={10}
                >
                  <Ionicons name="create-outline" size={16} color="#948F86" />
                </Pressable>
              </View>
              <View className="h-px bg-[#ECE7E0]" />
              <View className="px-4 py-3.5">
                <Text className="text-[12px] text-[#948F86]">
                  Email address
                </Text>
                <Text className="mt-0.5 text-[15px] text-[#26242A]">
                  {profile?.email}
                </Text>
              </View>
              <View className="h-px bg-[#ECE7E0]" />
              <View className="flex-row items-center gap-3 px-4 py-3.5">
                <View className="flex-1">
                  <Text className="text-[12px] text-[#948F86]">City</Text>
                  <TextInput
                    ref={cityInputRef}
                    placeholder="City"
                    placeholderTextColor="#A8A39B"
                    value={city}
                    onChangeText={setCity}
                    className="mt-0.5 text-[15px] text-[#26242A]"
                    style={{ outlineWidth: 0, padding: 0 }}
                  />
                </View>
                <Pressable
                  onPress={() => cityInputRef.current?.focus()}
                  hitSlop={10}
                >
                  <Ionicons name="create-outline" size={16} color="#948F86" />
                </Pressable>
              </View>
            </View>

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
                disabled={!isDirty}
              />
            </View>

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

            <Pressable
              onPress={handleLogout}
              className="mt-6 flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white px-4 py-3.5"
            >
              <Ionicons name="log-out-outline" size={20} color="#E5484D" />
              <Text className="text-[15px] font-semibold text-[#E5484D]">
                Log out
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/delete-account')}
              className="mt-3 items-center py-2"
            >
              <Text className="text-[13px] text-[#817F80]">Delete account</Text>
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
