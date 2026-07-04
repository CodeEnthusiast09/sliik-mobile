import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMyResponses } from '@/hooks/services/offers';
import { formatDateTimeLabel } from '@/lib/utils';

import { STATUS_COLORS } from '../bookings-list/index.styles';
import { styles } from './index.styles';

export function ProviderBidsScreen() {
  const router = useRouter();
  const { data: responses, isLoading, isRefetching, refetch } = useMyResponses();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          My bids
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <FlatList
            data={responses}
            keyExtractor={(response) => response.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No bids yet. Browse open offers to submit one.
              </ThemedText>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ pathname: '/offers/[id]', params: { id: item.offerId } })}
              >
                <ThemedView type="backgroundElement" style={styles.row}>
                  <ThemedText type="default">{item.offer?.serviceType ?? 'Offer'}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    Your price: ₦{item.offeredPrice}
                    {item.offer ? ` · Preferred: ${formatDateTimeLabel(item.offer.preferredFrom)}` : ''}
                  </ThemedText>
                  <ThemedText
                    type="smallBold"
                    style={
                      item.status === 'accepted'
                        ? { color: STATUS_COLORS.confirmed }
                        : item.status === 'declined'
                          ? { color: STATUS_COLORS.cancelled }
                          : { color: STATUS_COLORS.pending }
                    }
                  >
                    {item.status}
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
