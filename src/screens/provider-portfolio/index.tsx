import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Alert, FlatList, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ListSkeleton } from '@/components/skeleton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useAddPortfolioItem,
  useDeletePortfolioItem,
  usePortfolio,
} from '@/hooks/services/portfolio';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';

import { styles } from './index.styles';

export function ProviderPortfolioScreen() {
  const {
    data: portfolio,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
  } = usePortfolio();
  const uploadImageMutation = useUploadImage();
  const addPortfolioItemMutation = useAddPortfolioItem();
  const deletePortfolioItemMutation = useDeletePortfolioItem();

  async function handleAddPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (result.canceled) return;

    const uploadResponse = await uploadImageMutation.mutateAsync(
      result.assets[0],
    );
    if (uploadResponse.data) {
      addPortfolioItemMutation.mutate({ imageUrl: uploadResponse.data.url });
    }
  }

  function handleRemove(id: string) {
    // react-native-web's Alert.alert() is a no-op, so it needs a real
    // browser confirm() dialog on web instead.
    if (Platform.OS === 'web') {
      if (window.confirm('Remove photo? This cannot be undone.')) {
        deletePortfolioItemMutation.mutate(id);
      }
      return;
    }

    Alert.alert('Remove photo?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deletePortfolioItemMutation.mutate(id),
      },
    ]);
  }

  const isAdding =
    uploadImageMutation.isPending || addPortfolioItemMutation.isPending;
  const addError = uploadImageMutation.isError
    ? getErrorMessage(uploadImageMutation.error)
    : addPortfolioItemMutation.isError
      ? getErrorMessage(addPortfolioItemMutation.error)
      : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Portfolio</ThemedText>
          <Pressable onPress={handleAddPhoto} disabled={isAdding}>
            <ThemedView type="backgroundElement" style={styles.addButton}>
              <ThemedText type="smallBold">
                {isAdding ? 'Adding...' : '+ Add'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ThemedView>

        {addError && (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {addError}
          </ThemedText>
        )}

        {isLoading ? (
          <ListSkeleton />
        ) : isError ? (
          <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={portfolio}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            ListEmptyComponent={
              <EmptyState message="No portfolio photos yet. Add some to showcase your work." />
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleRemove(item.id)}
                style={styles.gridItem}
              >
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.gridImage}
                />
                <ThemedView type="backgroundElement" style={styles.deleteBadge}>
                  <ThemedText type="small">Remove</ThemedText>
                </ThemedView>
              </Pressable>
            )}
          />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
