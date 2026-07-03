import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useProviders } from '@/hooks/services/discovery';
import type { ProviderProfile } from '@/interfaces/provider';
import { calculateDistanceKm, getErrorMessage } from '@/lib/utils';

import { styles } from './index.styles';

const RATING_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'Any rating', value: undefined },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

export function CustomerHomeScreen() {
  const router = useRouter();

  const [cityInput, setCityInput] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [selectedTradeType, setSelectedTradeType] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [nearMeEnabled, setNearMeEnabled] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      city: appliedCity || undefined,
      tradeType: selectedTradeType ?? undefined,
      minRating,
      lat: nearMeEnabled ? userCoords?.lat : undefined,
      lng: nearMeEnabled ? userCoords?.lng : undefined,
    }),
    [appliedCity, selectedTradeType, minRating, nearMeEnabled, userCoords],
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProviders(filters);

  // Unfiltered baseline query, used only to seed the category chip options -
  // filtering the main list narrows `providers` itself, which would make
  // already-selected categories disappear from the chip row.
  const { data: categorySeed } = useProviders({});

  const providers = useMemo(() => data?.pages.flatMap((page) => page.data ?? []) ?? [], [data]);

  const tradeTypeOptions = useMemo(() => {
    const rows = categorySeed?.pages.flatMap((page) => page.data ?? []) ?? [];
    const options = new Set<string>();
    for (const provider of rows) {
      // 'pending' is a sentinel the backend sets for providers who haven't
      // finished onboarding yet - they shouldn't be offered as a real category.
      if (provider.tradeType && provider.tradeType !== 'pending') {
        options.add(provider.tradeType);
      }
    }
    return Array.from(options).sort();
  }, [categorySeed]);

  const displayProviders = useMemo(() => {
    if (!nearMeEnabled || !userCoords) return providers;
    return [...providers].sort((a, b) => distanceOf(a) - distanceOf(b));

    function distanceOf(provider: ProviderProfile) {
      if (!userCoords || provider.latitude == null || provider.longitude == null) return Infinity;
      return calculateDistanceKm(userCoords.lat, userCoords.lng, provider.latitude, provider.longitude);
    }
  }, [providers, nearMeEnabled, userCoords]);

  function getDistanceLabel(provider: ProviderProfile) {
    if (!nearMeEnabled || !userCoords || provider.latitude == null || provider.longitude == null) {
      return null;
    }
    const distance = calculateDistanceKm(
      userCoords.lat,
      userCoords.lng,
      provider.latitude,
      provider.longitude,
    );
    return `${distance.toFixed(1)} km away`;
  }

  async function handleToggleNearMe() {
    if (nearMeEnabled) {
      setNearMeEnabled(false);
      return;
    }

    setLocationError(null);
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      setLocationError('Location permission denied');
      return;
    }

    const position = await Location.getCurrentPositionAsync({});
    setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    setNearMeEnabled(true);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Sliik
        </ThemedText>

        <TextInput
          placeholder="Search by city"
          value={cityInput}
          onChangeText={setCityInput}
          onSubmitEditing={() => setAppliedCity(cityInput.trim())}
          returnKeyType="search"
          style={styles.input}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Pressable onPress={() => setSelectedTradeType(null)}>
            <ThemedView
              type={selectedTradeType === null ? 'backgroundSelected' : 'backgroundElement'}
              style={styles.chip}
            >
              <ThemedText type="small">All</ThemedText>
            </ThemedView>
          </Pressable>
          {tradeTypeOptions.map((tradeType) => (
            <Pressable key={tradeType} onPress={() => setSelectedTradeType(tradeType)}>
              <ThemedView
                type={selectedTradeType === tradeType ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.chip}
              >
                <ThemedText type="small">{tradeType}</ThemedText>
              </ThemedView>
            </Pressable>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {RATING_OPTIONS.map((option) => (
            <Pressable key={option.label} onPress={() => setMinRating(option.value)}>
              <ThemedView
                type={minRating === option.value ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.chip}
              >
                <ThemedText type="small">{option.label}</ThemedText>
              </ThemedView>
            </Pressable>
          ))}
          <Pressable onPress={handleToggleNearMe}>
            <ThemedView type={nearMeEnabled ? 'backgroundSelected' : 'backgroundElement'} style={styles.chip}>
              <ThemedText type="small">{nearMeEnabled ? 'Near me ✓' : 'Near me'}</ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>

        {locationError && (
          <ThemedText type="small" style={styles.error}>
            {locationError}
          </ThemedText>
        )}

        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : isError ? (
          <ThemedText type="small" style={styles.error}>
            {getErrorMessage(error)}
          </ThemedText>
        ) : (
          <FlatList
            data={displayProviders}
            keyExtractor={(provider) => provider.id}
            contentContainerStyle={styles.listContent}
            refreshing={isRefetching}
            onRefresh={refetch}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) fetchNextPage();
            }}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <ThemedText type="small" themeColor="textSecondary">
                No providers found. Try a different filter.
              </ThemedText>
            }
            ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.loading} /> : null}
            renderItem={({ item }) => {
              const rating = Number(item.avgRating);
              const distanceLabel = getDistanceLabel(item);
              return (
                <Pressable
                  onPress={() => router.push({ pathname: '/home/[id]', params: { id: item.id } })}
                >
                  <ThemedView type="backgroundElement" style={styles.card}>
                    <ThemedView style={styles.cardAvatar}>
                      {item.avatarUrl ? (
                        <Image source={{ uri: item.avatarUrl }} style={styles.cardAvatarImage} />
                      ) : (
                        <ThemedText type="small">{item.fullName.charAt(0).toUpperCase()}</ThemedText>
                      )}
                    </ThemedView>
                    <ThemedView style={styles.cardInfo}>
                      <ThemedText type="default">{item.fullName}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.tradeType}
                        {item.city ? ` · ${item.city}` : ''}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.totalReviews > 0
                          ? `★ ${rating.toFixed(1)} (${item.totalReviews})`
                          : 'No reviews yet'}
                        {distanceLabel ? ` · ${distanceLabel}` : ''}
                      </ThemedText>
                    </ThemedView>
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
