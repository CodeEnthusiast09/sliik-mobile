import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { NotificationBell } from '@/components/notification-bell';
import { ReviewsList } from '@/components/reviews-list';
import { DetailSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { usePayoutAccount } from '@/hooks/services/payouts';
import { useProviderProfile, useUpdateProviderProfile } from '@/hooks/services/provider';
import { useReviewsForUser } from '@/hooks/services/reviews';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';
import { unregisterPushToken } from '@/services/notifications';
import { useAuthStore } from '@/store/auth';
import { usePushTokenStore } from '@/store/push-token';
import { updateProviderProfileSchema } from '@/validations/provider-profile';

import { styles } from './index.styles';

export function ProviderProfileScreen() {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const { data: profile, isLoading, isError, error: profileError, refetch } = useProviderProfile();
  const { data: payoutAccount } = usePayoutAccount();
  const updateProfileMutation = useUpdateProviderProfile();
  const uploadImageMutation = useUploadImage();
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(profile?.userId);

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
    setYearsExperience(profile.yearsExperience != null ? String(profile.yearsExperience) : '');
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
          <ThemedView style={styles.headerRow}>
            <ThemedText type="title">Profile</ThemedText>
            <NotificationBell onPress={() => router.push('/profile/notifications')} />
          </ThemedView>

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
          <ThemedTextInput
            placeholder="Trade (e.g. hairdresser, barber)"
            value={tradeType}
            onChangeText={setTradeType}
            style={styles.input}
          />
          <ThemedTextInput
            placeholder="Years of experience"
            value={yearsExperience}
            onChangeText={setYearsExperience}
            style={styles.input}
            keyboardType="number-pad"
          />
          <ThemedTextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />
          <ThemedTextInput
            placeholder="Bio"
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.bioInput]}
            multiline
          />

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

          <Pressable onPress={() => router.push('/profile/payout')} style={styles.row}>
            <ThemedView type="backgroundElement" style={styles.rowContent}>
              <ThemedText type="default">Payout details</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {payoutAccount ? payoutAccount.accountName : 'Not set up'}
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
