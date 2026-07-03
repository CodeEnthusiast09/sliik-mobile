import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useBooking,
  useCancelBooking,
  useCompleteBooking,
  useConfirmBooking,
  useDeclineBooking,
} from '@/hooks/services/bookings';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { STATUS_COLORS } from '../bookings-list/index.styles';
import { styles } from './index.styles';

export function BookingDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: booking, isLoading } = useBooking(id);
  const confirmMutation = useConfirmBooking();
  const declineMutation = useDeclineBooking();
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();

  if (isLoading || !booking) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const otherParty = role === 'customer' ? booking.provider : booking.customer;
  const serverError = confirmMutation.isError
    ? getErrorMessage(confirmMutation.error)
    : declineMutation.isError
      ? getErrorMessage(declineMutation.error)
      : cancelMutation.isError
        ? getErrorMessage(cancelMutation.error)
        : completeMutation.isError
          ? getErrorMessage(completeMutation.error)
          : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          {booking.service?.name ?? 'Booking'}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: STATUS_COLORS[booking.status] }}>
          {booking.status}
        </ThemedText>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="default">{formatDateTimeLabel(booking.scheduledAt)}</ThemedText>
          {otherParty && (
            <ThemedText type="small" themeColor="textSecondary">
              {role === 'customer' ? 'Provider' : 'Customer'}: {otherParty.fullName}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            Total: ₦{booking.totalAmount} · Payment: {booking.paymentStatus}
          </ThemedText>
          {booking.notes && (
            <ThemedText type="small" themeColor="textSecondary">
              Notes: {booking.notes}
            </ThemedText>
          )}
        </ThemedView>

        {serverError && (
          <ThemedText type="small" style={styles.error}>
            {serverError}
          </ThemedText>
        )}

        {role === 'provider' && booking.status === 'pending' && (
          <ThemedView style={styles.actionRow}>
            <Pressable
              onPress={() => confirmMutation.mutate(booking.id)}
              disabled={confirmMutation.isPending || declineMutation.isPending}
              style={styles.actionButton}
            >
              <ThemedView type="backgroundElement" style={styles.submitButton}>
                <ThemedText type="smallBold">
                  {confirmMutation.isPending ? 'Confirming...' : 'Confirm'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable
              onPress={() => declineMutation.mutate(booking.id)}
              disabled={confirmMutation.isPending || declineMutation.isPending}
              style={styles.actionButton}
            >
              <ThemedView type="backgroundElement" style={styles.submitButton}>
                <ThemedText type="smallBold" style={styles.destructiveText}>
                  {declineMutation.isPending ? 'Declining...' : 'Decline'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        )}

        {role === 'provider' && booking.status === 'confirmed' && (
          <ThemedView style={styles.actionRow}>
            <Pressable
              onPress={() => completeMutation.mutate(booking.id)}
              disabled={completeMutation.isPending || cancelMutation.isPending}
              style={styles.actionButton}
            >
              <ThemedView type="backgroundElement" style={styles.submitButton}>
                <ThemedText type="smallBold">
                  {completeMutation.isPending ? 'Completing...' : 'Mark complete'}
                </ThemedText>
              </ThemedView>
            </Pressable>
            <Pressable
              onPress={() => cancelMutation.mutate(booking.id)}
              disabled={completeMutation.isPending || cancelMutation.isPending}
              style={styles.actionButton}
            >
              <ThemedView type="backgroundElement" style={styles.submitButton}>
                <ThemedText type="smallBold" style={styles.destructiveText}>
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
        )}

        {role === 'customer' && (booking.status === 'pending' || booking.status === 'confirmed') && (
          <Pressable
            onPress={() => cancelMutation.mutate(booking.id)}
            disabled={cancelMutation.isPending}
            style={styles.standaloneButton}
          >
            <ThemedView type="backgroundElement" style={styles.submitButton}>
              <ThemedText type="smallBold" style={styles.destructiveText}>
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel booking'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
