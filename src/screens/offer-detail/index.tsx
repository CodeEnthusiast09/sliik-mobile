import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/components/error-state';
import { DetailSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import {
  useAcceptResponse,
  useCancelOffer,
  useOffer,
  useRespondToOffer,
} from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';
import { respondToOfferSchema } from '@/validations/offer';

import { styles } from './index.styles';

export function OfferDetailScreen() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: offer, isLoading, isError, error, refetch } = useOffer(id);
  const { data: provider } = useProviderProfile(role === 'provider');
  const cancelMutation = useCancelOffer();
  const respondMutation = useRespondToOffer();
  const acceptMutation = useAcceptResponse();

  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  function handleRespond() {
    if (!offer) return;
    setFieldError(null);

    const result = respondToOfferSchema.safeParse({
      offeredPrice: Number(price),
      message: message || undefined,
    });
    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    respondMutation.mutate({ offerId: offer.id, payload: result.data });
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

  if (isLoading || !offer) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <DetailSkeleton />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const ownResponse = provider ? offer.responses?.find((r) => r.providerId === provider.id) : undefined;
  const serverError = cancelMutation.isError
    ? getErrorMessage(cancelMutation.error)
    : respondMutation.isError
      ? getErrorMessage(respondMutation.error)
      : acceptMutation.isError
        ? getErrorMessage(acceptMutation.error)
        : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            {offer.serviceType}
          </ThemedText>
          <ThemedText type="smallBold">{offer.status}</ThemedText>

          <ThemedView type="backgroundElement" style={styles.card}>
            <ThemedText type="default">{offer.description}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {offer.budget ? `Budget: ₦${offer.budget}` : 'Open to offers'} · {offer.city}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Preferred: {formatDateTimeLabel(offer.preferredFrom)} - {formatDateTimeLabel(offer.preferredTo)}
            </ThemedText>
          </ThemedView>

          {serverError && (
            <ThemedText type="small" themeColor="danger" style={styles.error}>
              {serverError}
            </ThemedText>
          )}

          {role === 'customer' && offer.status === 'open' && (
            <Pressable
              onPress={() => cancelMutation.mutate(offer.id)}
              disabled={cancelMutation.isPending}
              style={styles.standaloneButton}
            >
              <ThemedView type="backgroundElement" style={styles.submitButton}>
                <ThemedText type="smallBold" themeColor="danger">
                  {cancelMutation.isPending ? 'Cancelling...' : 'Cancel offer'}
                </ThemedText>
              </ThemedView>
            </Pressable>
          )}

          {role === 'customer' && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Responses
              </ThemedText>
              {offer.responses?.length ? (
                offer.responses.map((response) => (
                  <ThemedView key={response.id} type="backgroundElement" style={styles.responseRow}>
                    <ThemedText type="default">{response.provider?.fullName ?? 'Provider'}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      ₦{response.offeredPrice}
                      {response.message ? ` · ${response.message}` : ''}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {response.status}
                    </ThemedText>
                    {response.status === 'pending' && offer.status === 'open' && (
                      <Pressable
                        onPress={() => acceptMutation.mutate({ offerId: offer.id, responseId: response.id })}
                        disabled={acceptMutation.isPending}
                      >
                        <ThemedView type="backgroundSelected" style={styles.acceptButton}>
                          <ThemedText type="smallBold">
                            {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
                          </ThemedText>
                        </ThemedView>
                      </Pressable>
                    )}
                  </ThemedView>
                ))
              ) : (
                <ThemedText type="small" themeColor="textSecondary">
                  No responses yet.
                </ThemedText>
              )}
            </>
          )}

          {role === 'provider' && ownResponse && (
            <ThemedView type="backgroundElement" style={styles.responseRow}>
              <ThemedText type="default">Your response</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ₦{ownResponse.offeredPrice}
                {ownResponse.message ? ` · ${ownResponse.message}` : ''}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {ownResponse.status}
              </ThemedText>
            </ThemedView>
          )}

          {role === 'provider' && !ownResponse && offer.status === 'open' && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Respond with a price
              </ThemedText>
              <ThemedTextInput
                placeholder="Your price"
                value={price}
                onChangeText={setPrice}
                style={styles.input}
                keyboardType="decimal-pad"
              />
              <ThemedTextInput
                placeholder="Message (optional)"
                value={message}
                onChangeText={setMessage}
                style={styles.input}
              />
              {fieldError && (
                <ThemedText type="small" themeColor="danger" style={styles.error}>
                  {fieldError}
                </ThemedText>
              )}
              <Pressable onPress={handleRespond} disabled={respondMutation.isPending}>
                <ThemedView type="backgroundElement" style={styles.submitButton}>
                  <ThemedText type="smallBold">
                    {respondMutation.isPending ? 'Submitting...' : 'Submit response'}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            </>
          )}

          {role === 'provider' && !ownResponse && offer.status !== 'open' && (
            <ThemedText type="small" themeColor="textSecondary">
              This offer is no longer open.
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
