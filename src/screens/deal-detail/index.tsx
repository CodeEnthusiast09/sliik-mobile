import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { DetailSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAvailableSlots } from '@/hooks/services/bookings';
import { useClaimDeal, useDeal, useDeleteDeal } from '@/hooks/services/deals';
import { formatDateLabel, formatDateTimeLabel, formatTimeLabel, getErrorMessage, getNextDates } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { styles } from './index.styles';

const DATE_OPTIONS = getNextDates(14);

export function DealDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: deal, isLoading, isError, error, refetch } = useDeal(id);
  const deleteMutation = useDeleteDeal();
  const claimMutation = useClaimDeal();

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlots(
    deal?.providerId ?? '',
    selectedDate,
    deal?.serviceId ?? '',
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleDelete() {
    if (!deal) return;

    // react-native-web's Alert.alert() is a no-op, so it needs a real
    // browser confirm() dialog on web instead.
    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this deal? This cannot be undone.')) {
        deleteMutation.mutate(deal.id, { onSuccess: () => router.back() });
      }
      return;
    }

    Alert.alert('Cancel this deal?', 'This cannot be undone.', [
      { text: 'Keep deal', style: 'cancel' },
      {
        text: 'Cancel deal',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(deal.id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  function handleClaim() {
    if (!deal) return;
    setFieldError(null);

    if (!selectedSlot) {
      setFieldError('Pick a time slot');
      return;
    }

    claimMutation.mutate(
      { dealId: deal.id, payload: { scheduledAt: selectedSlot } },
      {
        onSuccess: (response) => {
          if (response.data) {
            router.replace({ pathname: '/bookings/[id]', params: { id: response.data.id } });
          }
        },
      },
    );
  }

  if (isError) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isLoading || !deal) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <DetailSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const isLive = deal.slotsRemaining > 0 && new Date(deal.expiresAt) > new Date();
  const serverError = deleteMutation.isError
    ? getErrorMessage(deleteMutation.error)
    : claimMutation.isError
      ? getErrorMessage(claimMutation.error)
      : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            {deal.title}
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            {deal.description && <ThemedText type="default">{deal.description}</ThemedText>}
            <ThemedText type="small" themeColor="textSecondary">
              {role === 'customer' ? deal.provider?.fullName : deal.service?.name} · ₦{deal.dealPrice}{' '}
              (was ₦{deal.originalPrice})
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {deal.slotsRemaining} of {deal.slotsTotal} slots left · Expires{' '}
              {formatDateTimeLabel(deal.expiresAt)}
            </ThemedText>
          </ThemedView>

          {serverError && (
            <ThemedText type="small" themeColor="danger" style={styles.error}>
              {serverError}
            </ThemedText>
          )}

          {role === 'provider' && (
            <Pressable
              onPress={handleDelete}
              disabled={deleteMutation.isPending}
              style={styles.standaloneButton}
            >
              <ThemedView type="backgroundElement" style={styles.submitButton}>
                <ThemedText type="smallBold" themeColor="danger">
                  {deleteMutation.isPending ? 'Cancelling...' : 'Cancel deal'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}

          {role === 'customer' && isLive && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Pick a date
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {DATE_OPTIONS.map((date) => (
                  <Pressable key={date} onPress={() => handleSelectDate(date)}>
                    <ThemedView
                      type={selectedDate === date ? 'backgroundSelected' : 'backgroundElement'}
                      style={styles.chip}
                    >
                      <ThemedText type="small">{formatDateLabel(date)}</ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </ScrollView>

              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Pick a time
              </ThemedText>
              {isLoadingSlots ? (
                <ActivityIndicator style={styles.loading} />
              ) : slotsData?.slots.length ? (
                <ThemedView style={styles.slotGrid}>
                  {slotsData.slots.map((slot) => (
                    <Pressable key={slot} onPress={() => setSelectedSlot(slot)}>
                      <ThemedView
                        type={selectedSlot === slot ? 'backgroundSelected' : 'backgroundElement'}
                        style={styles.chip}
                      >
                        <ThemedText type="small">{formatTimeLabel(slot)}</ThemedText>
                      </ThemedView>
                    </Pressable>
                  ))}
                </ThemedView>
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  No available times on this date.
                </ThemedText>
              )}

              {fieldError && (
                <ThemedText type="small" themeColor="danger" style={styles.error}>
                  {fieldError}
                </ThemedText>
              )}

              <Pressable onPress={handleClaim} disabled={claimMutation.isPending}>
                <ThemedView type="backgroundElement" style={styles.submitButton}>
                  <ThemedText type="smallBold">
                    {claimMutation.isPending ? 'Claiming...' : 'Claim deal'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </>
          )}

          {role === 'customer' && !isLive && (
            <ThemedText type="small" themeColor="textSecondary">
              This deal is no longer available.
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
