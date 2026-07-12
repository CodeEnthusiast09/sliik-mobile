import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { StatusPill } from '@/components/status-pill';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useBooking,
  useCancelBooking,
  useCompleteBooking,
  useConfirmBooking,
  useDeclineBooking,
} from '@/hooks/services/bookings';
import { useInitiatePayment } from '@/hooks/services/payments';
import {
  useCreateReview,
  useReviewsForBooking,
} from '@/hooks/services/reviews';
import { CHATTABLE_STATUSES } from '@/lib/constants';
import {
  formatCurrency,
  formatDateTimeLabel,
  formatDurationLabel,
  formatTradeTypeLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { showToast } from '@/store/toast';
import { createReviewSchema } from '@/validations/review';

const PAYMENT_LABEL = {
  unpaid: 'Payment pending',
  paid: 'Paid',
  refunded: 'Refunded',
} as const;

const PAYMENT_COLOR = {
  unpaid: '#E0A800',
  paid: '#2F9E44',
  refunded: '#817F80',
} as const;

export function BookingDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();

  useHideTabBar();

  const {
    data: booking,
    isLoading,
    isError,
    error,
    refetch: refetchBooking,
  } = useBooking(id);
  const confirmMutation = useConfirmBooking();
  const declineMutation = useDeclineBooking();
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();
  const initiatePaymentMutation = useInitiatePayment();
  const { data: bookingReviews } = useReviewsForBooking(id);
  const createReviewMutation = useCreateReview();

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(false);

  const notificationsHref =
    role === 'provider' ? '/profile/notifications' : '/home/notifications';

  function onMutationError(error: unknown) {
    showToast(getErrorMessage(error), 'error');
  }

  async function handlePayNow() {
    if (!booking) return;

    try {
      const response = await initiatePaymentMutation.mutateAsync(booking.id);
      if (!response.data) return;

      await WebBrowser.openAuthSessionAsync(
        response.data.checkoutUrl,
        'sliik://payment/success',
      );

      // Paystack's redirect fires whether the user actually paid or just
      // backed out, and the webhook that flips paymentStatus can lag
      // slightly behind it - poll a few times rather than trusting one refetch.
      setIsProcessingPayment(true);
      for (let attempt = 0; attempt < 3; attempt++) {
        const result = await refetchBooking();
        if (result.data?.paymentStatus === 'paid') break;
        if (attempt < 2)
          await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  }

  function handleSubmitReview() {
    if (!booking) return;
    setCommentError(false);

    const result = createReviewSchema.safeParse({
      bookingId: booking.id,
      rating,
      comment: comment || undefined,
    });
    if (!result.success) {
      setCommentError(true);
      showToast(result.error.issues[0]?.message ?? 'Invalid review', 'error');
      return;
    }

    createReviewMutation.mutate(result.data, {
      onError: (error) => {
        setCommentError(true);
        showToast(getErrorMessage(error), 'error');
      },
    });
  }

  if (isError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState
              message={getErrorMessage(error)}
              onRetry={refetchBooking}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoading || !booking) {
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

  const otherParty = role === 'customer' ? booking.provider : booking.customer;
  const myUserId =
    role === 'customer' ? booking.customer?.userId : booking.provider?.userId;
  const myReview = bookingReviews?.find(
    (review) => review.reviewerId === myUserId,
  );
  const theirReview = bookingReviews?.find(
    (review) => review.reviewerId !== myUserId,
  );
  const canPayNow =
    role === 'customer' &&
    booking.paymentStatus === 'unpaid' &&
    booking.status !== 'cancelled' &&
    booking.status !== 'declined';

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Booking detail"
            notificationsHref={notificationsHref}
            showNotifications={false}
            onBack={() =>
              // Reached either by tapping a row in the bookings list (has
              // real back history) or via a cross-tab replace() right after
              // submitting a new booking (no back history at all) - guard
              // against the latter throwing a GO_BACK navigation error.
              router.canGoBack() ? router.back() : router.replace('/bookings')
            }
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <View className="mt-4">
              <StatusPill status={booking.status} />
            </View>

            <Text className="mt-3 font-serif-bold text-[26px] leading-[32px] text-[#26242A]">
              {booking.service?.name ?? 'Booking'}
            </Text>
            {role === 'customer' && booking.provider?.tradeType ? (
              <Text className="mt-0.5 text-[14px] text-[#817F80]">
                {formatTradeTypeLabel(booking.provider.tradeType)}
              </Text>
            ) : null}

            {role === 'customer' && booking.provider ? (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/home/[id]',
                    params: { id: booking.provider!.id },
                  })
                }
                className="mt-5 flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-2.5"
              >
                <Avatar
                  uri={booking.provider.avatarUrl}
                  name={booking.provider.fullName}
                  size={96}
                  shape="square"
                />

                <View className="flex-1 gap-2.5">
                  <Text className="font-serif-bold text-[16px] text-[#26242A]">
                    {booking.provider.fullName}
                  </Text>

                  {booking.provider.totalReviews > 0 ? (
                    <Text className="text-[13px] text-[#26242A]">
                      ★ {Number(booking.provider.avgRating).toFixed(1)} (
                      {booking.provider.totalReviews})
                    </Text>
                  ) : null}

                  {booking.provider.city ? (
                    <View className="flex-row items-center gap-1">
                      <Ionicons
                        name="location-outline"
                        size={13}
                        color="#817F80"
                      />
                      <Text className="text-[13px] text-[#817F80]">
                        {booking.provider.city}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#A8A39B" />
              </Pressable>
            ) : (
              <View className="mt-5 flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                <Avatar
                  uri={otherParty?.avatarUrl}
                  name={otherParty?.fullName ?? '?'}
                  size={56}
                />
                <View className="flex-1">
                  <Text className="text-[12px] text-[#817F80]">Customer</Text>
                  <Text className="font-serif-bold text-[16px] text-[#26242A]">
                    {otherParty?.fullName ?? 'Customer'}
                  </Text>
                </View>
              </View>
            )}

            <View className="mt-5 gap-4 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
              <View className="flex-row gap-3">
                <View className="flex-1 flex-row items-center gap-2.5">
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color="#817F80"
                  />
                  <View className="flex-1">
                    <Text className="text-[12px] text-[#817F80]">
                      Date & time
                    </Text>
                    <Text className="text-[14px] text-[#26242A]">
                      {formatDateTimeLabel(booking.scheduledAt)}
                    </Text>
                  </View>
                </View>

                <View className="flex-1 flex-row items-center gap-2.5">
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#817F80"
                  />
                  <View className="flex-1">
                    <Text className="text-[12px] text-[#817F80]">
                      Location
                    </Text>
                    <Text className="text-[14px] text-[#26242A]">
                      {booking.provider?.city ?? 'Not set'}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 flex-row items-center gap-2.5">
                  {booking.service?.durationMinutes ? (
                    <>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color="#817F80"
                      />
                      <View className="flex-1">
                        <Text className="text-[12px] text-[#817F80]">
                          Duration
                        </Text>
                        <Text className="text-[14px] text-[#26242A]">
                          {formatDurationLabel(
                            booking.service.durationMinutes,
                          )}
                        </Text>
                      </View>
                    </>
                  ) : null}
                </View>

                <View className="flex-1 flex-row items-center gap-2.5">
                  <Ionicons name="pricetag-outline" size={16} color="#817F80" />
                  <View className="flex-1">
                    <Text className="text-[12px] text-[#817F80]">Price</Text>
                    <Text className="text-[14px] text-[#26242A]">
                      ₦{formatCurrency(booking.totalAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {booking.notes ? (
              <View className="mt-3 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                <Text className="text-[12px] text-[#817F80]">Notes</Text>
                <Text className="mt-1 text-[14px] text-[#26242A]">
                  {booking.notes}
                </Text>
              </View>
            ) : null}

            <View
              style={{
                backgroundColor: `${PAYMENT_COLOR[booking.paymentStatus]}1F`,
              }}
              className="mt-3 gap-1 rounded-[20px] p-4"
            >
              <Text className="text-[13px] font-bold text-[#4A473F]">
                Payment status
              </Text>
              <View className="flex-row items-center gap-2">
                <Ionicons
                  name={
                    booking.paymentStatus === 'paid'
                      ? 'checkmark-circle'
                      : 'ellipse-outline'
                  }
                  size={18}
                  color={PAYMENT_COLOR[booking.paymentStatus]}
                />
                <Text
                  style={{ color: PAYMENT_COLOR[booking.paymentStatus] }}
                  className="text-[15px] font-bold"
                >
                  {PAYMENT_LABEL[booking.paymentStatus]}
                </Text>
              </View>
            </View>

            {canPayNow ? (
              <View className="mt-5">
                <Button
                  label={
                    initiatePaymentMutation.isPending
                      ? 'Opening checkout…'
                      : isProcessingPayment
                        ? 'Checking payment…'
                        : 'Pay now'
                  }
                  onPress={handlePayNow}
                  disabled={
                    initiatePaymentMutation.isPending || isProcessingPayment
                  }
                />
                <View className="mt-2 flex-row items-center justify-center gap-1">
                  <Text className="text-[12px] text-[#817F80]">
                    Secure payments by
                  </Text>
                  <Image
                    source={require('../../../assets/images/paystack-icon.png')}
                    style={{ width: 12, height: 12 }}
                    contentFit="contain"
                  />
                  <Text className="text-[12px] font-bold text-[#26242A]">
                    paystack
                  </Text>
                </View>
              </View>
            ) : null}

            {CHATTABLE_STATUSES.includes(booking.status) ? (
              <View className={canPayNow ? 'mt-3' : 'mt-5'}>
                <Button
                  variant="social"
                  label={
                    otherParty?.fullName
                      ? `Message ${otherParty.fullName.split(' ')[0]}`
                      : 'Message'
                  }
                  leftIcon={
                    <Ionicons
                      name="chatbubble-outline"
                      size={18}
                      color="#26242A"
                    />
                  }
                  onPress={() =>
                    router.push({
                      pathname: '/chats/[id]',
                      params: { id: booking.id },
                    })
                  }
                />
              </View>
            ) : null}

            {role === 'provider' && booking.status === 'pending' ? (
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Button
                    label={
                      confirmMutation.isPending ? 'Confirming…' : 'Confirm'
                    }
                    onPress={() =>
                      confirmMutation.mutate(booking.id, {
                        onError: onMutationError,
                      })
                    }
                    disabled={
                      confirmMutation.isPending || declineMutation.isPending
                    }
                  />
                </View>
                <View className="flex-1">
                  <Button
                    variant="social"
                    label={declineMutation.isPending ? 'Declining…' : 'Decline'}
                    onPress={() =>
                      declineMutation.mutate(booking.id, {
                        onError: onMutationError,
                      })
                    }
                    disabled={
                      confirmMutation.isPending || declineMutation.isPending
                    }
                  />
                </View>
              </View>
            ) : null}

            {role === 'provider' && booking.status === 'confirmed' ? (
              <View className="mt-3 flex-row gap-3">
                <View className="flex-1">
                  <Button
                    label={
                      completeMutation.isPending
                        ? 'Completing…'
                        : 'Mark complete'
                    }
                    onPress={() =>
                      completeMutation.mutate(booking.id, {
                        onError: onMutationError,
                      })
                    }
                    disabled={
                      completeMutation.isPending || cancelMutation.isPending
                    }
                  />
                </View>
                <View className="flex-1">
                  <Button
                    variant="social"
                    label={cancelMutation.isPending ? 'Cancelling…' : 'Cancel'}
                    onPress={() =>
                      cancelMutation.mutate(booking.id, {
                        onError: onMutationError,
                      })
                    }
                    disabled={
                      completeMutation.isPending || cancelMutation.isPending
                    }
                  />
                </View>
              </View>
            ) : null}

            {role === 'customer' &&
              (booking.status === 'pending' || booking.status === 'confirmed') ? (
              <View className="mt-3">
                <Button
                  variant="social"
                  label={
                    cancelMutation.isPending ? 'Cancelling…' : 'Cancel booking'
                  }
                  onPress={() =>
                    cancelMutation.mutate(booking.id, {
                      onError: onMutationError,
                    })
                  }
                  disabled={cancelMutation.isPending}
                />
              </View>
            ) : null}

            {booking.status === 'declined' || booking.status === 'cancelled' ? (
              <View className="mt-5 items-center gap-2 rounded-[20px] border border-[#ECE7E0] bg-white p-6">
                <Ionicons
                  name="close-circle-outline"
                  size={30}
                  color="#817F80"
                />
                <Text className="text-center text-[14px] text-[#817F80]">
                  {booking.status === 'declined'
                    ? 'This booking was declined.'
                    : 'This booking was cancelled.'}
                </Text>
              </View>
            ) : null}

            {booking.status === 'completed' ? (
              <View className="mt-7 gap-3">
                <Text className="font-serif-bold text-[18px] text-[#26242A]">
                  How was your experience?
                </Text>
                <Text className="text-[14px] text-[#817F80]">
                  {otherParty?.fullName
                    ? `Leave a review for ${otherParty.fullName}`
                    : 'Leave a mutual review.'}
                </Text>

                {theirReview ? (
                  <View className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                    <Text className="text-[13px] text-[#817F80]">
                      What {otherParty?.fullName} said:
                    </Text>
                    <Text className="text-[16px] text-[#E0A800]">
                      {'★'.repeat(theirReview.rating)}
                      {'☆'.repeat(5 - theirReview.rating)}
                    </Text>
                    {theirReview.comment ? (
                      <Text className="text-[14px] text-[#26242A]">
                        {theirReview.comment}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                {myReview ? (
                  <View className="gap-1 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                    <Text className="text-[13px] text-[#817F80]">
                      Your review:
                    </Text>
                    <Text className="text-[16px] text-[#E0A800]">
                      {'★'.repeat(myReview.rating)}
                      {'☆'.repeat(5 - myReview.rating)}
                    </Text>
                    {myReview.comment ? (
                      <Text className="text-[14px] text-[#26242A]">
                        {myReview.comment}
                      </Text>
                    ) : null}
                  </View>
                ) : (
                  <View className="gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-4">
                    <View className="flex-row gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Pressable
                          key={value}
                          onPress={() => setRating(value)}
                          hitSlop={4}
                        >
                          <Text className="text-[26px] text-[#E0A800]">
                            {value <= rating ? '★' : '☆'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {rating === 0 ? (
                      <Text className="text-[12px] text-[#817F80]">
                        Tap a star to rate
                      </Text>
                    ) : null}
                    <TextInput
                      placeholder="What stood out about the service?"
                      placeholderTextColor="#A8A39B"
                      value={comment}
                      onChangeText={(text) => {
                        setComment(text);
                        if (commentError) setCommentError(false);
                      }}
                      multiline
                      className={`min-h-[70px] rounded-[14px] border px-4 py-3 text-[15px] text-[#26242A] ${commentError ? 'border-[#E5484D]' : 'border-[#ECE7E0]'
                        }`}
                      style={{ textAlignVertical: 'top', outlineWidth: 0 }}
                    />
                    <Button
                      label={
                        createReviewMutation.isPending
                          ? 'Submitting…'
                          : 'Submit review'
                      }
                      onPress={handleSubmitReview}
                      disabled={createReviewMutation.isPending}
                    />
                  </View>
                )}
              </View>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
