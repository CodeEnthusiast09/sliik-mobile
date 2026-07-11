import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { DateChip } from '@/components/date-chip';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useAvailableSlots, useCreateBooking } from '@/hooks/services/bookings';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import {
  formatCurrency,
  formatDurationLabel,
  formatTime12hLabel,
  getDateChipParts,
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

  useHideTabBar();

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
  const dateScrollRef = useRef<ScrollView>(null);
  const dateScrollOffset = useRef(0);
  const [canScrollDateBack, setCanScrollDateBack] = useState(false);

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
      <View className="flex-1 bg-white">
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
      <View className="flex-1 bg-white">
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
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <EmptyState message="Service not found." />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Book appointment"
            notificationsHref="/home/notifications"
            onBack={() => router.back()}
            showNotifications={false}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <View className="mt-5 flex-row gap-3 overflow-hidden rounded-[20px] bg-[#F3F0EB] p-4">
              <View className="w-20 self-stretch overflow-hidden rounded-2xl bg-[#E7E1D9]">
                {provider.avatarUrl ? (
                  <Image
                    source={{ uri: provider.avatarUrl }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-[28px] font-bold text-[#4B2E46]">
                      {provider.fullName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-1 justify-center gap-1.5">
                <Text className="font-serif-bold text-[17px] text-[#26242A]">
                  {service.name}
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="time-outline" size={14} color="#817F80" />
                    <Text className="text-[13px] text-[#817F80]">
                      {formatDurationLabel(service.durationMinutes)}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="pricetag-outline" size={14} color="#817F80" />
                    <Text className="text-[13px] text-[#817F80]">
                      ₦{formatCurrency(service.price)}
                    </Text>
                  </View>
                </View>
                <View className="mt-1 gap-0.5">
                  <Text className="text-[12px] text-[#A8A39B]">With</Text>
                  <Text className="text-[15px] font-bold text-[#26242A]">
                    {provider.fullName}
                  </Text>
                  {provider.city ? (
                    <Text className="text-[13px] text-[#817F80]">
                      {provider.city}, Nigeria
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Select date
            </Text>
            <View className="mt-3 flex-row items-center">
              {canScrollDateBack ? (
                <Pressable
                  onPress={() =>
                    dateScrollRef.current?.scrollTo({
                      x: Math.max(dateScrollOffset.current - 180, 0),
                      animated: true,
                    })
                  }
                  hitSlop={10}
                  className="mr-1.5 h-9 w-9 flex-none items-center justify-center rounded-full border border-[#ECE7E0] bg-white"
                >
                  <Ionicons name="chevron-back" size={18} color="#26242A" />
                </Pressable>
              ) : null}
              <ScrollView
                ref={dateScrollRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const offsetX = event.nativeEvent.contentOffset.x;
                  dateScrollOffset.current = offsetX;
                  setCanScrollDateBack(offsetX > 5);
                }}
                scrollEventThrottle={16}
                className="flex-1"
                contentContainerClassName="items-center gap-1.5"
              >
                {DATE_OPTIONS.map((date) => {
                  const { topLabel, day, month } = getDateChipParts(date);
                  return (
                    <DateChip
                      key={date}
                      topLabel={topLabel}
                      day={day}
                      month={month}
                      selected={selectedDate === date}
                      onPress={() => handleSelectDate(date)}
                    />
                  );
                })}
              </ScrollView>
              <Pressable
                onPress={() =>
                  dateScrollRef.current?.scrollTo({
                    x: dateScrollOffset.current + 180,
                    animated: true,
                  })
                }
                hitSlop={10}
                className="ml-1.5 h-9 w-9 flex-none items-center justify-center rounded-full border border-[#ECE7E0] bg-white"
              >
                <Ionicons name="chevron-forward" size={18} color="#26242A" />
              </Pressable>
            </View>

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Select time
            </Text>
            {isLoadingSlots ? (
              <ActivityIndicator className="mt-3" color="#4B2E46" />
            ) : slotsData?.slots.length ? (
              <View className="mt-3 w-full flex-row flex-wrap gap-2.5">
                {slotsData.slots.map((slot) => (
                  <Chip
                    key={slot}
                    label={formatTime12hLabel(slot)}
                    selected={selectedSlot === slot}
                    onPress={() => setSelectedSlot(slot)}
                    spacious={true}
                  />
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-[14px] text-[#817F80]">
                No available times on this date.
              </Text>
            )}

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Add notes (optional)
            </Text>
            <TextInput
              placeholder="Any special requests or notes?"
              placeholderTextColor="#A8A39B"
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setNotesFocused(true)}
              onBlur={() => setNotesFocused(false)}
              multiline
              maxLength={200}
              className={`mt-3 min-h-[76px] rounded-[16px] border bg-white px-5 py-4 text-[15px] text-[#26242A] ${notesFocused ? 'border-[#4B2E46]' : 'border-[#ECE7E0]'
                }`}
              style={{ textAlignVertical: 'top', outlineWidth: 0 }}
            />
            <Text className="mt-1 text-right text-[12px] text-[#A8A39B]">
              {notes.length}/200
            </Text>

            <View className="mt-7 flex-row items-center justify-between">
              <Text className="text-[15px] font-bold text-[#26242A]">
                Total
              </Text>
              <Text className="font-serif-bold text-[18px] text-[#26242A]">
                ₦{formatCurrency(service.price)}
              </Text>
            </View>

            <View className="mt-4 gap-2">
              <Button
                label={
                  createBookingMutation.isPending
                    ? 'Booking…'
                    : 'Request booking'
                }
                onPress={handleSubmit}
                loading={createBookingMutation.isPending}
                leftIcon={
                  <Ionicons name="calendar-outline" size={18} color="#F7EFE4" />
                }
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
