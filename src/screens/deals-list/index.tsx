import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useActiveDeals, useMyDeals } from '@/hooks/services/deals';
import type { Deal } from '@/interfaces/deal';
import { formatDateTimeLabel } from '@/lib/utils';
import { useAuthStore } from '@/store/auth';

import { styles } from './index.styles';

function priceLabel(deal: Deal) {
  return `₦${deal.dealPrice} (was ₦${deal.originalPrice})`;
}

export function DealsListScreen() {
  const role = useAuthStore((state) => state.role);
  return role === 'provider' ? <ProviderDealsList /> : <CustomerDealsFeed />;
}

function CustomerDealsFeed() {
  const router = useRouter();
  const { data: deals, isLoading, isRefetching, refetch } = useActiveDeals();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Deals
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={deals}
            keyExtractor={(deal) => deal.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No active deals right now. Check back soon.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Pressable onPress={() => router.push({ pathname: '/deals/[id]', params: { id: item.id } })}>
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="default">{item.title}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.provider?.fullName ?? 'Provider'} · {priceLabel(item)}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {item.slotsRemaining} of {item.slotsTotal} slots left · Expires{' '}
                    {formatDateTimeLabel(item.expiresAt)}
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

function ProviderDealsList() {
  const router = useRouter();
  const { data: deals, isLoading, isRefetching, refetch } = useMyDeals();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Deals</ThemedText>
          <Pressable onPress={() => router.push('/deals/new')}>
            <ThemedView type="backgroundElement" style={styles.addButton}>
              <ThemedText type="smallBold">+ New deal</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={deals}
            keyExtractor={(deal) => deal.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No deals yet. Post one to attract customers with a flash discount.
              </ThemedText>
            }
            renderItem={({ item }) => {
              const isLive = item.slotsRemaining > 0 && new Date(item.expiresAt) > new Date();
              return (
                <Pressable
                  onPress={() => router.push({ pathname: '/deals/[id]', params: { id: item.id } })}
                >
                  <ThemedView type="backgroundElement" style={styles.row}>
                    <ThemedText type="default">{item.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.service?.name ?? 'Service'} · {priceLabel(item)}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.slotsRemaining} of {item.slotsTotal} slots left · {isLive ? 'Live' : 'Ended'}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              );
            }}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
