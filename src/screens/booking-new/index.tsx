import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAvailableSlots, useCreateBooking } from '@/hooks/services/bookings';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import { formatDateLabel, formatTimeLabel, getErrorMessage, getNextDates } from '@/lib/utils';
import { createBookingSchema } from '@/validations/booking';

import { styles } from './index.styles';

const DATE_OPTIONS = getNextDates(14);

export function BookingNewScreen() {
  const router = useRouter();
  const { providerId, serviceId } = useLocalSearchParams<{ providerId: string; serviceId: string }>();

  const { data: provider, isLoading: isLoadingProvider } = usePublicProviderProfile(providerId);
  const service = provider?.services?.find((item) => item.id === serviceId);

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlots(
    providerId,
    selectedDate,
    serviceId,
  );
  const createBookingMutation = useCreateBooking();

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleSubmit() {
    setFieldError(null);

    if (!selectedSlot) {
      setFieldError('Pick a time slot');
      return;
    }

    const result = createBookingSchema.safeParse({
      providerId,
      serviceId,
      scheduledAt: selectedSlot,
      notes: notes || undefined,
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    createBookingMutation.mutate(result.data, {
      onSuccess: (response) => {
        if (response.data) {
          router.replace({ pathname: '/bookings/[id]', params: { id: response.data.id } });
        }
      },
    });
  }

  const serverError = createBookingMutation.isError
    ? getErrorMessage(createBookingMutation.error)
    : null;

  if (isLoadingProvider || !provider || !service) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            Book {service.name}
          </ThemedText>
          <ThemedText type="default" themeColor="textSecondary">
            with {provider.fullName} · ₦{service.price} · {service.durationMinutes} min
          </ThemedText>

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

          <TextInput
            placeholder="Notes for the provider (optional)"
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notesInput]}
            multiline
          />

          {(fieldError ?? serverError) && (
            <ThemedText type="small" style={styles.error}>
              {fieldError ?? serverError}
            </ThemedText>
          )}

          <Pressable onPress={handleSubmit} disabled={createBookingMutation.isPending}>
            <ThemedView type="backgroundElement" style={styles.submitButton}>
              <ThemedText type="smallBold">
                {createBookingMutation.isPending ? 'Booking...' : 'Request booking'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
