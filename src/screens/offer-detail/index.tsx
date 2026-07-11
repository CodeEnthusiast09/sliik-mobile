import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useAcceptResponse,
  useCancelOffer,
  useOffer,
  useRespondToOffer,
} from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import {
  formatCurrency,
  formatDateTimeLabel,
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

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Offer detail"
            notificationsHref={notificationsHref}
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <View className="mt-4 flex-row items-center justify-between">
              <Text className="font-serif-bold text-[24px] leading-[30px] text-[#26242A]">
                {offer.serviceType}
              </Text>
              <View className="rounded-full bg-[#F3F0EB] px-3 py-1.5">
                <Text className="text-[12px] font-bold text-[#26242A]">
                  {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                </Text>
              </View>
            </View>

            <View className="mt-4 gap-2 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
              <Text className="text-[14px] text-[#26242A]">
                {offer.description}
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                {offer.budget
                  ? `Budget ₦${formatCurrency(offer.budget)}`
                  : 'Open to offers'}{' '}
                · {offer.city}
              </Text>
              <Text className="text-[13px] text-[#817F80]">
                Preferred: {formatDateTimeLabel(offer.preferredFrom)} -{' '}
                {formatDateTimeLabel(offer.preferredTo)}
              </Text>
            </View>

            {role === 'customer' && offer.status === 'open' ? (
              <View className="mt-5">
                <Button
                  label={
                    cancelMutation.isPending ? 'Cancelling…' : 'Cancel offer'
                  }
                  variant="ghost"
                  onPress={() =>
                    cancelMutation.mutate(offer.id, {
                      onError: onMutationError,
                    })
                  }
                  loading={cancelMutation.isPending}
                />
              </View>
            ) : null}

            {role === 'customer' ? (
              <>
                <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
                  Responses
                </Text>
                {offer.responses?.length ? (
                  <View className="mt-3 gap-3">
                    {offer.responses.map((response) => (
                      <View
                        key={response.id}
                        className="flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                      >
                        <Avatar
                          uri={response.provider?.avatarUrl}
                          name={response.provider?.fullName ?? '?'}
                          size={48}
                        />
                        <View className="flex-1 gap-0.5">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="font-serif-bold text-[15px] text-[#26242A]">
                              {response.provider?.fullName ?? 'Provider'}
                            </Text>
                            {Number(response.provider?.totalReviews) > 0 ? (
                              <Text className="text-[12px] text-[#817F80]">
                                {Number(response.provider?.avgRating).toFixed(
                                  1,
                                )}{' '}
                                ★
                              </Text>
                            ) : null}
                          </View>
                          <Text className="text-[13px] text-[#817F80]">
                            ₦{formatCurrency(response.offeredPrice)}
                            {response.message ? ` · ${response.message}` : ''}
                          </Text>
                        </View>
                        {response.status === 'pending' &&
                        offer.status === 'open' ? (
                          <Button
                            label={
                              acceptMutation.isPending ? 'Accepting…' : 'Accept'
                            }
                            onPress={() =>
                              acceptMutation.mutate(
                                { offerId: offer.id, responseId: response.id },
                                { onError: onMutationError },
                              )
                            }
                            loading={acceptMutation.isPending}
                          />
                        ) : (
                          <View className="rounded-full bg-[#F3F0EB] px-3 py-1.5">
                            <Text className="text-[12px] font-bold text-[#26242A]">
                              {response.status}
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text className="mt-3 text-[14px] text-[#817F80]">
                    No responses yet.
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
