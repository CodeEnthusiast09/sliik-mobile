import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { StatusPill } from '@/components/status-pill';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useAcceptResponse,
  useCancelOffer,
  useOffer,
  useRespondToOffer,
} from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import type { OfferResponse } from '@/interfaces/offer';
import {
  formatBookingDateTimeLabel,
  formatCurrency,
  formatTradeTypeLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { showToast } from '@/store/toast';
import { respondToOfferSchema } from '@/validations/offer';

export function OfferDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  useHideTabBar();

  const { data: offer, isLoading, isError, error, refetch } = useOffer(id);
  const { data: provider } = useProviderProfile(role === 'provider');
  const cancelMutation = useCancelOffer();
  const respondMutation = useRespondToOffer();
  const acceptMutation = useAcceptResponse();

  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');

  function onMutationError(err: unknown) {
    showToast(getErrorMessage(err), 'error');
  }

  function handleRespond() {
    if (!offer) return;

    const result = respondToOfferSchema.safeParse({
      offeredPrice: Number(price),
      message: message || undefined,
    });
    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? 'Invalid input', 'error');
      return;
    }

    respondMutation.mutate(
      { offerId: offer.id, payload: result.data },
      { onError: onMutationError },
    );
  }

  function handleCancelOfferPress() {
    if (!offer) return;

    const cancel = () =>
      cancelMutation.mutate(offer.id, { onError: onMutationError });

    // react-native-web's Alert.alert() is a no-op, so it needs a real
    // browser confirm() dialog on web instead.
    if (Platform.OS === 'web') {
      if (window.confirm('Cancel this offer? This cannot be undone.')) {
        cancel();
      }
      return;
    }

    Alert.alert('Cancel this offer?', 'This cannot be undone.', [
      { text: 'Keep offer', style: 'cancel' },
      { text: 'Cancel offer', style: 'destructive', onPress: cancel },
    ]);
  }

  function handleAcceptPress(response: OfferResponse) {
    if (!offer) return;

    const confirm = () =>
      acceptMutation.mutate(
        { offerId: offer.id, responseId: response.id },
        {
          onSuccess: (result) => {
            if (result.data) {
              router.replace({
                pathname: '/bookings/[id]',
                params: { id: result.data.id },
              });
            }
          },
          onError: onMutationError,
        },
      );

    const message = `Accept ${response.provider?.fullName ?? 'this provider'}'s bid for ₦${formatCurrency(response.offeredPrice)}?`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) confirm();
      return;
    }

    Alert.alert('Accept this bid?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Accept', onPress: confirm },
    ]);
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

  if (isLoading || !offer) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1 px-6" edges={['top', 'bottom']}>
          <DetailSkeleton />
        </SafeAreaView>
      </View>
    );
  }

  const ownResponse = provider
    ? offer.responses?.find((r) => r.providerId === provider.id)
    : undefined;
  const responseCount = offer.responses?.length ?? 0;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Offer detail"
            notificationsHref={notificationsHref}
            showNotifications={false}
            onBack={() => router.back()}
            rightAction={
              role === 'customer' && offer.status === 'open' ? (
                <Pressable
                  onPress={handleCancelOfferPress}
                  hitSlop={10}
                  className="h-9 w-9 items-center justify-center"
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={24}
                    color="#4B2E46"
                  />
                </Pressable>
              ) : undefined
            }
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <View className="mt-4 gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-[13px] font-medium text-[#817F80]">
                  Your request
                </Text>
                <StatusPill status={offer.status} />
              </View>

              <View className="flex-row items-start gap-3">
                <View className="flex-1 gap-1.5">
                  <Text className="font-serif-bold text-[22px] leading-[27px] text-[#26242A]">
                    {offer.serviceType}
                  </Text>
                  <Text className="text-[14px] text-[#26242A]">
                    {offer.description}
                  </Text>
                  {offer.budget ? (
                    <Text className="text-[13px] text-[#817F80]">
                      Budget ₦{formatCurrency(offer.budget)}
                    </Text>
                  ) : null}
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color="#817F80"
                    />
                    <Text className="text-[13px] text-[#817F80]">
                      {offer.city}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="calendar-outline"
                      size={13}
                      color="#817F80"
                    />
                    <Text className="text-[13px] text-[#817F80]">
                      {formatBookingDateTimeLabel(offer.preferredFrom)}
                    </Text>
                  </View>
                </View>

                {offer.referenceImageUrl ? (
                  <Image
                    source={{ uri: offer.referenceImageUrl }}
                    style={{ width: 72, height: 72, borderRadius: 16 }}
                    contentFit="cover"
                  />
                ) : null}
              </View>
            </View>

            {role === 'customer' ? (
              <>
                <View className="mt-7 flex-row items-center justify-between">
                  <Text className="font-serif-bold text-[18px] text-[#26242A]">
                    Provider bids
                  </Text>
                  <Text className="text-[13px] text-[#817F80]">
                    {responseCount} {responseCount === 1 ? 'bid' : 'bids'}
                  </Text>
                </View>
                {offer.responses?.length ? (
                  <View className="mt-3 gap-3">
                    {offer.responses.map((response) => {
                      const subtitleParts = [
                        response.provider?.tradeType
                          ? formatTradeTypeLabel(response.provider.tradeType)
                          : null,
                        response.provider?.city,
                      ].filter((part): part is string => !!part);
                      const canAccept =
                        response.status === 'pending' &&
                        offer.status === 'open';

                      return (
                        <View
                          key={response.id}
                          className="flex-row items-start gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                        >
                          <Avatar
                            uri={response.provider?.avatarUrl}
                            name={response.provider?.fullName ?? '?'}
                            size={48}
                          />
                          <View className="flex-1 gap-0.5">
                            <Text className="font-serif-bold text-[15px] text-[#26242A]">
                              {response.provider?.fullName ?? 'Provider'}
                            </Text>
                            {subtitleParts.length ? (
                              <Text className="text-[12px] text-[#817F80]">
                                {subtitleParts.join(' • ')}
                              </Text>
                            ) : null}
                            {response.message ? (
                              <Text
                                className="text-[13px] text-[#26242A]"
                                numberOfLines={2}
                              >
                                {response.message}
                              </Text>
                            ) : null}
                            {Number(response.provider?.totalReviews) > 0 ? (
                              <Text className="text-[12px] text-[#817F80]">
                                {Number(response.provider?.avgRating).toFixed(
                                  1,
                                )}{' '}
                                ★ ({response.provider?.totalReviews})
                              </Text>
                            ) : null}
                          </View>
                          <View className="items-end gap-2">
                            <Text className="font-serif-bold text-[15px] text-[#26242A]">
                              ₦{formatCurrency(response.offeredPrice)}
                            </Text>
                            {canAccept ? (
                              <Pressable
                                onPress={() => handleAcceptPress(response)}
                                disabled={acceptMutation.isPending}
                                className={`rounded-full bg-[#4B2E46] px-4 py-2 ${
                                  acceptMutation.isPending
                                    ? 'opacity-50'
                                    : 'active:opacity-80'
                                }`}
                              >
                                {acceptMutation.isPending ? (
                                  <ActivityIndicator
                                    size="small"
                                    color="#F7EFE4"
                                  />
                                ) : (
                                  <Text className="text-[13px] font-medium text-[#F7EFE4]">
                                    Accept
                                  </Text>
                                )}
                              </Pressable>
                            ) : (
                              <StatusPill status={response.status} />
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text className="mt-3 text-[14px] text-[#817F80]">
                    No bids yet.
                  </Text>
                )}
              </>
            ) : null}

            {role === 'provider' && ownResponse ? (
              <View className="mt-7 gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                <Text className="font-serif-bold text-[15px] text-[#26242A]">
                  Your response
                </Text>
                <Text className="text-[13px] text-[#817F80]">
                  ₦{formatCurrency(ownResponse.offeredPrice)}
                  {ownResponse.message ? ` · ${ownResponse.message}` : ''}
                </Text>
                <Text className="text-[13px] text-[#817F80]">
                  {ownResponse.status}
                </Text>
              </View>
            ) : null}

            {role === 'provider' && !ownResponse && offer.status === 'open' ? (
              <>
                <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
                  Respond with a price
                </Text>
                <TextInput
                  placeholder="Your price"
                  placeholderTextColor="#A8A39B"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
                <TextInput
                  placeholder="Message (optional)"
                  placeholderTextColor="#A8A39B"
                  value={message}
                  onChangeText={setMessage}
                  className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
                <View className="mt-5">
                  <Button
                    label={
                      respondMutation.isPending
                        ? 'Submitting…'
                        : 'Submit response'
                    }
                    onPress={handleRespond}
                    loading={respondMutation.isPending}
                  />
                </View>
              </>
            ) : null}

            {role === 'provider' && !ownResponse && offer.status !== 'open' ? (
              <Text className="mt-7 text-[14px] text-[#817F80]">
                This offer is no longer open.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
