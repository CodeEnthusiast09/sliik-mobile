import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyOffers, useOpenOffers } from '@/hooks/services/offers';
import { useProviderProfile } from '@/hooks/services/provider';
import type { Offer } from '@/interfaces/offer';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { styles } from './index.styles';

function budgetLabel(offer: Offer) {
  return offer.budget ? `Budget: ₦${offer.budget}` : 'Open to offers';
}

export function OffersListScreen() {
  const role = useAuthStore((state) => state.role);
  return role === 'provider' ? <ProviderOffersFeed /> : <CustomerOffersList />;
}

function CustomerOffersList() {
  const router = useRouter();
  const { data: offers, isLoading, isError, error, isRefetching, refetch } = useMyOffers();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Offers</ThemedText>
          <Pressable onPress={() => router.push('/offers/new')}>
            <ThemedView type="backgroundElement" style={styles.addButton}>
              <ThemedText type="smallBold">+ Post offer</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(offer) => offer.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <EmptyState message="No offers posted yet. Post one to get price offers from providers." />
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push({ pathname: '/offers/[id]', params: { id: item.id } })}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="default">{item.serviceType}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {budgetLabel(item)} · {item.responses?.length ?? 0} response
                    {item.responses?.length === 1 ? '' : 's'}
                  </ThemedText>
                  <ThemedText type="smallBold">{item.status}</ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function ProviderOffersFeed() {
  const router = useRouter();
  const {
    data: provider,
    isLoading: isLoadingProvider,
    isError: isProviderError,
    error: providerError,
    refetch: refetchProvider,
  } = useProviderProfile();
  const { data: offers, isLoading, isError, error, isRefetching, refetch } = useOpenOffers();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Offers</ThemedText>
          <Pressable onPress={() => router.push('/offers/my-bids')}>
            <ThemedView type="backgroundElement" style={styles.addButton}>
              <ThemedText type="smallBold">My bids</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {isProviderError ? (
          <ErrorState message={getErrorMessage(providerError)} onRetry={refetchProvider} />
        ) : isLoadingProvider ? (
          <ActivityIndicator style={styles.loading} />
        ) : !provider?.city ? (
          <ThemedView type="backgroundElement" style={styles.row}>
            <ThemedText type="small" themeColor="textSecondary">
              Set your city in your profile to see open offers near you.
            </ThemedText>
          </ThemedView>
        ) : isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={offers}
            keyExtractor={(offer) => offer.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message={`No open offers in ${provider.city} right now.`} />}
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push({ pathname: '/offers/[id]', params: { id: item.id } })}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="default">{item.serviceType}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {budgetLabel(item)} · Preferred: {formatDateTimeLabel(item.preferredFrom)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
