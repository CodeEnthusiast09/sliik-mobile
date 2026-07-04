import { useRouter } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useServices } from '@/hooks/services/provider-services';
import { getErrorMessage } from '@/lib/utils';

import { styles } from './index.styles';

export function ProviderServicesScreen() {
  const router = useRouter();
  const { data: services, isLoading, isError, error, isRefetching, refetch } = useServices();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Services</ThemedText>
          <Pressable onPress={() => router.push('/services/new')}>
            <ThemedView type="backgroundElement" style={styles.addButton}>
              <ThemedText type="smallBold">+ Add</ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            data={services}
            keyExtractor={(service) => service.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={<EmptyState message="No services yet. Add one to let customers book you." />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ pathname: '/services/[id]', params: { id: item.id } })}
              >
                <ThemedView type="backgroundElement" style={styles.serviceRow}>
                  <ThemedText type="default">{item.name}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    ₦{item.price} · {item.durationMinutes} min
                    {!item.isActive ? ' · Inactive' : ''}
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
