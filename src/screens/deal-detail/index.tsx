import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { DateChip } from '@/components/date-chip';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { useCountdown } from '@/hooks/common/use-countdown';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useAvailableSlots } from '@/hooks/services/bookings';
import { useClaimDeal, useDeal, useDeleteDeal } from '@/hooks/services/deals';
import {
  calculateDistanceKm,
  formatCountdown,
  formatCurrency,
  formatDateTimeLabel,
  formatTime12hLabel,
  getDateChipParts,
  getErrorMessage,
  getNextDates,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { useLocationStore } from '@/store/location';
import { showToast } from '@/store/toast';

const DATE_OPTIONS = getNextDates(14);

export function DealDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';
  const userCoords = useLocationStore((state) => state.coords);

  // Same defensive request as customer-home/provider-detail - an
  // already-logged-in session never re-fires the login-time request.
  useEffect(() => {
    useLocationStore.getState().requestLocation();
  }, []);

  useHideTabBar();

  const { data: deal, isLoading, isError, error, refetch } = useDeal(id);
  const remainingMs = useCountdown(deal?.expiresAt ?? '');
  const deleteMutation = useDeleteDeal();
  const claimMutation = useClaimDeal();

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: slotsData, isLoading: isLoadingSlots } = useAvailableSlots(
    deal?.providerId ?? '',
    selectedDate,
    deal?.serviceId ?? '',
  );

  function handleSelectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
  }

  function handleShare() {
    if (!deal) return;
    const link = Linking.createURL(`/deals/${deal.id}`);
    Share.share({
      message: `${deal.title} - ₦${formatCurrency(deal.dealPrice)} (was ₦${formatCurrency(deal.originalPrice)}) on Sliik! ${link}`,
    });
  }

  function handleDelete() {
    if (!deal) return;

    // react-native-web's Alert.alert() is a no-op, so it needs a real
    // browser confirm() dialog on web instead.
    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this deal? This cannot be undone.')) {
        deleteMutation.mutate(deal.id, {
          onSuccess: () => router.back(),
          onError: (err) => showToast(getErrorMessage(err), 'error'),
        });
      }
      return;
    }

    Alert.alert('Cancel this deal?', 'This cannot be undone.', [
      { text: 'Keep deal', style: 'cancel' },
      {
        text: 'Cancel deal',
        style: 'destructive',
        onPress: () =>
          deleteMutation.mutate(deal.id, {
            onSuccess: () => router.back(),
            onError: (err) => showToast(getErrorMessage(err), 'error'),
          }),
      },
    ]);
  }

  function handleClaim() {
    if (!deal) return;

    if (!selectedSlot) {
      showToast('Pick a time slot', 'error');
      return;
    }

    claimMutation.mutate(
      { dealId: deal.id, payload: { scheduledAt: selectedSlot } },
      {
        onSuccess: (response) => {
          if (response.data) {
            router.replace({
              pathname: '/bookings/[id]',
              params: { id: response.data.id },
            });
          }
        },
        onError: (err) => showToast(getErrorMessage(err), 'error'),
      },
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 px-6" edges={['top', 'bottom']}>
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        </SafeAreaView>
      </View>
    );
  }

  if (isLoading || !deal) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 px-6" edges={['top', 'bottom']}>
          <DetailSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  const isLive =
    deal.slotsRemaining > 0 && new Date(deal.expiresAt) > new Date();
  const photoUrl = deal.provider?.portfolio?.[0]?.imageUrl;
  const discountPercent = Math.round(
    (1 - Number(deal.dealPrice) / Number(deal.originalPrice)) * 100,
  );
  const distanceLabel =
    userCoords &&
    deal.provider?.latitude != null &&
    deal.provider?.longitude != null
      ? `${calculateDistanceKm(
          userCoords.lat,
          userCoords.lng,
          deal.provider.latitude,
          deal.provider.longitude,
        ).toFixed(1)} km away`
      : null;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Deal detail"
            notificationsHref={notificationsHref}
            onBack={() => router.back()}
            rightAction={
              <Pressable
                onPress={handleShare}
                hitSlop={10}
                className="h-9 w-9 items-center justify-center"
              >
                <Ionicons name="share-outline" size={22} color="#4B2E46" />
              </Pressable>
            }
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <View className="mt-4 overflow-hidden rounded-[20px] bg-[#2A2226]">
              <View className="h-56 w-full">
                {photoUrl ? (
                  <Image
                    source={{ uri: photoUrl }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                    contentFit="cover"
                  />
                ) : null}
                <LinearGradient
                  colors={[
                    'transparent',
                    'rgba(0,0,0,0.25)',
                    'rgba(0,0,0,0.88)',
                  ]}
                  locations={[0, 0.4, 1]}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
                <View className="absolute left-3 top-3 rounded-full bg-[#4B2E46] px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-white">
                    {discountPercent}% OFF
                  </Text>
                </View>
                {isLive ? (
                  <View className="absolute right-3 top-3 flex-row items-center gap-1 rounded-full bg-black/55 px-2.5 py-1">
                    <Ionicons name="time-outline" size={12} color="white" />
                    <Text className="text-[11px] font-bold text-white">
                      Ends in {formatCountdown(remainingMs)}
                    </Text>
                  </View>
                ) : null}
                <View className="absolute bottom-0 left-0 right-0 gap-1 p-4">
                  <Text className="font-serif-bold text-[20px] leading-[24px] text-white">
                    {deal.title}
                  </Text>
                  <Text className="text-[13px] text-[#E7E1DC]">
                    {role === 'customer'
                      ? `by ${deal.provider?.fullName}`
                      : deal.service?.name}
                  </Text>
                </View>
              </View>

              <View className="gap-3 bg-white p-4">
                {deal.description ? (
                  <Text className="text-[13px] text-[#817F80]">
                    {deal.description}
                  </Text>
                ) : null}

                <View className="flex-row items-center justify-between border-t border-[#E7E1D9] pt-3">
                  <Text className="text-[15px] font-bold text-[#4A473F]">
                    Deal price
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <Text className="text-[14px] text-[#817F80] line-through">
                      ₦{formatCurrency(deal.originalPrice)}
                    </Text>
                    <Text className="font-serif-bold text-[20px] text-[#4B2E46]">
                      ₦{formatCurrency(deal.dealPrice)}
                    </Text>
                  </View>
                </View>

                {role === 'customer' ? (
                  <View className="flex-row items-center gap-2">
                    {Number(deal.provider?.totalReviews) > 0 ? (
                      <Text className="text-[13px] font-bold text-[#26242A]">
                        ★ {Number(deal.provider?.avgRating).toFixed(1)} (
                        {deal.provider?.totalReviews})
                      </Text>
                    ) : null}
                    {deal.provider?.city ? (
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="location-outline"
                          size={13}
                          color="#817F80"
                        />
                        <Text className="text-[13px] text-[#817F80]">
                          {deal.provider.city}
                          {distanceLabel ? ` · ${distanceLabel}` : ''}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <Text className="text-[13px] text-[#817F80]">
                  {deal.slotsRemaining} of {deal.slotsTotal} slots left ·
                  Expires {formatDateTimeLabel(deal.expiresAt)}
                </Text>
              </View>
            </View>

            {role === 'provider' ? (
              <View className="mt-5">
                <Button
                  label={
                    deleteMutation.isPending ? 'Cancelling…' : 'Cancel deal'
                  }
                  variant="ghost"
                  onPress={handleDelete}
                  loading={deleteMutation.isPending}
                />
              </View>
            ) : null}

            {role === 'customer' && isLive ? (
              <>
                <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
                  Pick a date
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-3 flex-none"
                  contentContainerClassName="items-center gap-2 pr-6"
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

                <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
                  Pick a time
                </Text>
                {isLoadingSlots ? (
                  <ActivityIndicator className="mt-3" color="#4B2E46" />
                ) : slotsData?.slots.length ? (
                  <View className="mt-3 flex-row flex-wrap gap-2.5">
                    {slotsData.slots.map((slot) => (
                      <Chip
                        key={slot}
                        label={formatTime12hLabel(slot)}
                        selected={selectedSlot === slot}
                        onPress={() => setSelectedSlot(slot)}
                        spacious
                      />
                    ))}
                  </View>
                ) : (
                  <Text className="mt-3 text-[14px] text-[#817F80]">
                    No available times on this date.
                  </Text>
                )}

                <View className="mt-7">
                  <Button
                    label={claimMutation.isPending ? 'Claiming…' : 'Claim deal'}
                    onPress={handleClaim}
                    loading={claimMutation.isPending}
                  />
                </View>
              </>
            ) : null}

            {role === 'customer' && !isLive ? (
              <Text className="mt-5 text-[14px] text-[#817F80]">
                This deal is no longer available.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
