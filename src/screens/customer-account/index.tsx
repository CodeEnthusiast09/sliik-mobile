import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { ReviewsList } from '@/components/reviews-list';
import { DetailSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useCustomerProfile, useUpdateCustomerProfile } from '@/hooks/services/customer';
import { useReviewsForUser } from '@/hooks/services/reviews';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';
import { unregisterPushToken } from '@/services/notifications';
import { useAuthStore } from '@/store/auth';
import { usePushTokenStore } from '@/store/push-token';
import { updateCustomerProfileSchema } from '@/validations/customer-profile';

import { styles } from './index.styles';

export function CustomerAccountScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const { data: profile, isLoading, isError, error: profileError, refetch } = useCustomerProfile();
  const updateProfileMutation = useUpdateCustomerProfile();
  const uploadImageMutation = useUploadImage();
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(profile?.userId);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [syncedProfileId, setSyncedProfileId] = useState<string | null>(null);

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

    const uploadResponse = await uploadImageMutation.mutateAsync(result.assets[0]);
    if (uploadResponse.data) {
      updateProfileMutation.mutate({ avatarUrl: uploadResponse.data.url });
    }
  }

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
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ErrorState message={getErrorMessage(profileError)} onRetry={refetch} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <DetailSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Account</ThemedText>

          <Pressable onPress={handlePickAvatar}>
            <ThemedView type="backgroundElement" style={styles.avatar}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <ThemedText type="small">Add photo</ThemedText>
              )}
            </ThemedView>
          </Pressable>

          <ThemedTextInput
            placeholder="Full name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            autoCapitalize="words"
          />
          <ThemedTextInput
            placeholder="Phone"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />
          <ThemedTextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />

          {(fieldError ?? serverError) && (
            <ThemedText type="small" themeColor="danger">
              {fieldError ?? serverError}
            </ThemedText>
          )}

          <Pressable onPress={handleSave} disabled={updateProfileMutation.isPending}>
            <ThemedView type="backgroundElement" style={styles.submitButton}>
              <ThemedText type="smallBold">
                {updateProfileMutation.isPending ? 'Saving...' : 'Save changes'}
              </ThemedText>
            </ThemedView>
          </Pressable>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Reviews received
          </ThemedText>
          <ReviewsList
            averageRating={userReviews?.averageRating ?? null}
            totalReviews={userReviews?.totalReviews ?? 0}
            reviews={userReviews?.reviews ?? []}
            isLoading={isLoadingReviews}
          />

          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <ThemedText type="smallBold" themeColor="danger">
              Log out
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
