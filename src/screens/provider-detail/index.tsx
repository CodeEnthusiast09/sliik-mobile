import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePublicProviderProfile } from '@/hooks/services/discovery';

import { styles } from './index.styles';

export function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: provider, isLoading } = usePublicProviderProfile(id);

  if (isLoading || !provider) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator />
        </SafeAreaView>
      </ThemedView>
    );
  }

  const rating = Number(provider.avgRating);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.avatar}>
              {provider.avatarUrl ? (
                <Image source={{ uri: provider.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <ThemedText type="subtitle">{provider.fullName.charAt(0).toUpperCase()}</ThemedText>
              )}
            </ThemedView>
            <ThemedText type="title" style={styles.name}>
              {provider.fullName}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {provider.tradeType}
              {provider.city ? ` · ${provider.city}` : ''}
            </ThemedText>
            <ThemedText type="default" themeColor="textSecondary">
              {provider.totalReviews > 0
                ? `★ ${rating.toFixed(1)} (${provider.totalReviews} review${provider.totalReviews === 1 ? '' : 's'})`
                : 'No reviews yet'}
            </ThemedText>
            {provider.yearsExperience > 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                {provider.yearsExperience} year{provider.yearsExperience === 1 ? '' : 's'} of experience
              </ThemedText>
            )}
          </ThemedView>

          {provider.bio && (
            <ThemedText type="default" style={styles.bio}>
              {provider.bio}
            </ThemedText>
          )}

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Services
          </ThemedText>
          {provider.services?.length ? (
            provider.services.map((service) => (
              <ThemedView key={service.id} type="backgroundElement" style={styles.serviceRow}>
                <ThemedText type="default">{service.name}</ThemedText>
                {service.description && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {service.description}
                  </ThemedText>
                )}
                <ThemedText type="small" themeColor="textSecondary">
                  ₦{service.price} · {service.durationMinutes} min
                </ThemedText>
              </ThemedView>
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              No services listed yet.
            </ThemedText>
          )}

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Portfolio
          </ThemedText>
          {provider.portfolio?.length ? (
            <FlatList
              data={provider.portfolio}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <ThemedView style={styles.gridItem}>
                  <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
                </ThemedView>
              )}
            />
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              No portfolio photos yet.
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
