import { useRouter } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/common/use-theme';
import { useMyResponses } from '@/hooks/services/offers';
import { formatDateTimeLabel, getErrorMessage } from '@/lib/utils';

import { styles } from './index.styles';

export function ProviderBidsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { data: responses, isLoading, isError, error, isRefetching, refetch } = useMyResponses();

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
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={responses}
            keyExtractor={(response) => response.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message="No bids yet. Browse open offers to submit one." />}
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
                        ? { color: theme.success }
                        : item.status === 'declined'
                          ? { color: theme.danger }
                          : { color: theme.warning }
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
