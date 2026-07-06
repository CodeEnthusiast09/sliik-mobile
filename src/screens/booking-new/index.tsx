import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { useAvailableSlots, useCreateBooking } from '@/hooks/services/bookings';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import {
  formatCurrency,
  formatDateLabel,
  formatTimeLabel,
  getErrorMessage,
  getNextDates,
} from '@/lib/utils';
import { showToast } from '@/store/toast';
import { createBookingSchema } from '@/validations/booking';

const DATE_OPTIONS = getNextDates(14);

export function BookingNewScreen() {
  const router = useRouter();
  const { providerId, serviceId } = useLocalSearchParams<{
    providerId: string;
    serviceId: string;
  }>();

  const {
    data: provider,
    isLoading: isLoadingProvider,
    isError: isProviderError,
    error: providerError,
    refetch: refetchProvider,
  } = usePublicProviderProfile(providerId);
  const service = provider?.services?.find((item) => item.id === serviceId);

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [notesFocused, setNotesFocused] = useState(false);

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
    if (!selectedSlot) {
      showToast('Pick a time slot', 'error');
      return;
    }

    const result = createBookingSchema.safeParse({
      providerId,
      serviceId,
      scheduledAt: selectedSlot,
      notes: notes || undefined,
    });

    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? 'Invalid input', 'error');
      return;
    }

    createBookingMutation.mutate(result.data, {
      onSuccess: (response) => {
        if (response.data) {
          router.replace({
            pathname: '/bookings/[id]',
            params: { id: response.data.id },
          });
        }
      },
      onError: (error) => showToast(getErrorMessage(error), 'error'),
    });
  }

  if (isProviderError) {
    return (
      <View className="flex-1 bg-[#FBF8F3]">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState
              message={getErrorMessage(providerError)}
              onRetry={refetchProvider}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoadingProvider || !provider) {
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

  if (!service) {
    return (
      <View className="flex-1 bg-[#FBF8F3]">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <EmptyState message="Service not found." />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Book appointment"
            notificationsHref="/home/notifications"
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <View className="mt-5 gap-3 rounded-[20px] bg-[#F3F0EB] p-4">
              <View>
                <Text className="font-serif-bold text-[19px] text-[#26242A]">
                  {service.name}
                </Text>
                <Text className="mt-0.5 text-[14px] text-[#817F80]">
                  {provider.fullName}
                  {provider.city ? ` • ${provider.city}` : ''}
                </Text>
              </View>
              <View className="flex-row items-center justify-between border-t border-[#E7E1D9] pt-3">
                <Text className="text-[14px] font-bold text-[#4A473F]">
                  {service.durationMinutes} min
                </Text>
                <Text className="font-serif-bold text-[18px] text-[#4B2E46]">
                  ₦{formatCurrency(service.price)}
                </Text>
              </View>
            </View>

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 h-11 flex-none"
              contentContainerClassName="items-center gap-2 pr-6"
            >
              {DATE_OPTIONS.map((date) => (
                <Chip
                  key={date}
                  label={formatDateLabel(date)}
                  selected={selectedDate === date}
                  onPress={() => handleSelectDate(date)}
                />
              ))}
            </ScrollView>

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Time slot
            </Text>
            {isLoadingSlots ? (
              <ActivityIndicator className="mt-3" color="#4B2E46" />
            ) : slotsData?.slots.length ? (
              <View className="mt-3 flex-row flex-wrap gap-2.5">
                {slotsData.slots.map((slot) => (
                  <Chip
                    key={slot}
                    label={formatTimeLabel(slot)}
                    selected={selectedSlot === slot}
                    onPress={() => setSelectedSlot(slot)}
                  />
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-[14px] text-[#817F80]">
                No available times on this date.
              </Text>
            )}

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Notes
            </Text>
            <TextInput
              placeholder="Waist-length braids, medium size. I can come to studio."
              placeholderTextColor="#A8A39B"
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setNotesFocused(true)}
              onBlur={() => setNotesFocused(false)}
              multiline
              className={`mt-3 min-h-[76px] rounded-[16px] border bg-white px-5 py-4 text-[15px] text-[#26242A] ${
                notesFocused ? 'border-[#4B2E46]' : 'border-[#ECE7E0]'
              }`}
              style={{ textAlignVertical: 'top', outlineWidth: 0 }}
            />

            <View className="mt-7">
              <Button
                label={
                  createBookingMutation.isPending
                    ? 'Booking…'
                    : 'Request booking'
                }
                onPress={handleSubmit}
                loading={createBookingMutation.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
