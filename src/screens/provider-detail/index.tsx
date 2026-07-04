import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReviewsList } from '@/components/reviews-list';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePublicProviderProfile } from '@/hooks/services/discovery';
import { useReviewsForUser } from '@/hooks/services/reviews';

import { styles } from './index.styles';

export function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: provider, isLoading } = usePublicProviderProfile(id);
  const { data: userReviews, isLoading: isLoadingReviews } = useReviewsForUser(provider?.userId);

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
              <Pressable
                key={service.id}
                onPress={() =>
                  router.push({
                    pathname: '/home/book',
                    params: { providerId: provider.id, serviceId: service.id },
                  })
                }
              >
                <ThemedView type="backgroundElement" style={styles.serviceRow}>
                  <ThemedText type="default">{service.name}</ThemedText>
                  {service.description && (
                    <ThemedText type="small" themeColor="textSecondary">
                      {service.description}
                    </ThemedText>
                  )}
                  <ThemedText type="small" themeColor="textSecondary">
                    ₦{service.price} · {service.durationMinutes} min
                  </ThemedText>
                  <ThemedText type="link">Book this service</ThemedText>
                </ThemedView>
              </Pressable>
            ))
          ) : (
            <ThemedText type="small" themeColor="textSecondary">
              No services listed yet.
            </ThemedText>
          )}

          {!!provider.deals?.length && (
            <>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Flash deals
              </ThemedText>
              {provider.deals.map((deal) => (
                <Pressable
                  key={deal.id}
                  onPress={() => router.push({ pathname: '/deals/[id]', params: { id: deal.id } })}
                >
                  <ThemedView type="backgroundElement" style={styles.serviceRow}>
                    <ThemedText type="default">{deal.title}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      ₦{deal.dealPrice} (was ₦{deal.originalPrice}) · {deal.slotsRemaining} slot
                      {deal.slotsRemaining === 1 ? '' : 's'} left
                    </ThemedText>
                    <ThemedText type="link">View deal</ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </>
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

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Reviews
          </ThemedText>
          <ReviewsList
            averageRating={userReviews?.averageRating ?? null}
            totalReviews={userReviews?.totalReviews ?? 0}
            reviews={userReviews?.reviews ?? []}
            isLoading={isLoadingReviews}
          />
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
