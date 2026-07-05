import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useProviders } from '@/hooks/services/discovery';
import type { ProviderProfile } from '@/interfaces/provider';
import { calculateDistanceKm, getErrorMessage } from '@/lib/utils';
import { useLocationStore } from '@/store/location';

const RATING_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'Any rating', value: undefined },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
  { label: '4.5+', value: 4.5 },
];

export function CustomerHomeScreen() {
  const router = useRouter();
  const userCoords = useLocationStore((state) => state.coords);

  const [cityInput, setCityInput] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [selectedTradeType, setSelectedTradeType] = useState<string | null>(
    null,
  );
  const [minRating, setMinRating] = useState<number | undefined>(undefined);

  const filters = useMemo(
    () => ({
      city: appliedCity || undefined,
      tradeType: selectedTradeType ?? undefined,
      minRating,
      lat: userCoords?.lat,
      lng: userCoords?.lng,
    }),
    [appliedCity, selectedTradeType, minRating, userCoords],
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

  const providers = useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  );

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
    if (!userCoords) return providers;
    return [...providers].sort((a, b) => distanceOf(a) - distanceOf(b));

    function distanceOf(provider: ProviderProfile) {
      if (
        !userCoords ||
        provider.latitude == null ||
        provider.longitude == null
      )
        return Infinity;
      return calculateDistanceKm(
        userCoords.lat,
        userCoords.lng,
        provider.latitude,
        provider.longitude,
      );
    }
  }, [providers, userCoords]);

  function getDistanceLabel(provider: ProviderProfile) {
    if (!userCoords || provider.latitude == null || provider.longitude == null)
      return null;
    const distance = calculateDistanceKm(
      userCoords.lat,
      userCoords.lng,
      provider.latitude,
      provider.longitude,
    );
    return `${distance.toFixed(1)} km away`;
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref="/home/notifications" />

          <Text className="mt-4 font-serif-bold text-[30px] leading-[36px] text-[#26242A]">
            Beauty near you
          </Text>

          <View className="mt-5 flex-row items-center gap-3 rounded-2xl border border-[#ECE7E0] bg-white px-4 py-2.5">
            <Ionicons name="search-outline" size={18} color="#948F86" />
            <TextInput
              placeholder="Search by city"
              placeholderTextColor="#948F86"
              value={cityInput}
              onChangeText={setCityInput}
              onSubmitEditing={() => setAppliedCity(cityInput.trim())}
              returnKeyType="search"
              className="flex-1 text-[15px] text-[#26242A]"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4 h-11 flex-none"
            contentContainerClassName="items-center gap-2 pr-6"
          >
            <Chip
              label="All"
              selected={selectedTradeType === null}
              onPress={() => setSelectedTradeType(null)}
            />
            {tradeTypeOptions.map((tradeType) => (
              <Chip
                key={tradeType}
                label={tradeType}
                selected={selectedTradeType === tradeType}
                onPress={() => setSelectedTradeType(tradeType)}
              />
            ))}
          </ScrollView>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 h-11 flex-none"
            contentContainerClassName="items-center gap-2 pr-6"
          >
            {RATING_OPTIONS.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                selected={minRating === option.value}
                onPress={() => setMinRating(option.value)}
              />
            ))}
          </ScrollView>

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                data={displayProviders}
                keyExtractor={(provider) => provider.id}
                contentContainerClassName="gap-3 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                onEndReached={() => {
                  if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                }}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={
                  <EmptyState message="No providers found. Try a different filter." />
                }
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <ActivityIndicator className="mt-4" />
                  ) : null
                }
                renderItem={({ item }) => {
                  const rating = Number(item.avgRating);
                  const distanceLabel = getDistanceLabel(item);
                  return (
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/home/[id]',
                          params: { id: item.id },
                        })
                      }
                      className="flex-row items-center gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-3"
                    >
                      <Avatar
                        uri={item.avatarUrl}
                        name={item.fullName}
                        size={68}
                        shape="square"
                      />

                      <View className="flex-1 gap-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-serif-bold text-[16px] text-[#26242A]">
                            {item.fullName}
                          </Text>
                          {item.totalReviews > 0 ? (
                            <View className="rounded-full bg-[#F3F0EB] px-2.5 py-1">
                              <Text className="text-[12px] font-bold text-[#26242A]">
                                {rating.toFixed(1)} ★
                              </Text>
                            </View>
                          ) : null}
                        </View>
                        <Text className="text-[13px] text-[#817F80]">
                          {item.tradeType}
                          {item.city ? ` • ${item.city}` : ''}
                        </Text>
                        <Text className="text-[13px] text-[#817F80]">
                          {item.totalReviews > 0
                            ? `${item.totalReviews} reviews`
                            : 'No reviews yet'}
                          {distanceLabel ? ` • ${distanceLabel}` : ''}
                        </Text>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
