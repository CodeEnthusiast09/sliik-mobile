import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { ListSkeleton } from '@/components/skeleton';
import { useDebounce } from '@/hooks/common/use-debounce';
import { useCustomerProfile } from '@/hooks/services/customer';
import { useProviders } from '@/hooks/services/discovery';
import type { ProviderProfile } from '@/interfaces/provider';
import {
  CATEGORIES,
  SUPPORTED_CITIES,
  type ServiceCategory,
} from '@/lib/constants';
import { calculateDistanceKm, getErrorMessage } from '@/lib/utils';
import { useLocationStore } from '@/store/location';

import { HomeListHeader } from './_components/home-list-header';
import {
  LocationHeader,
  type LocationHeaderHandle,
  type LocationMode,
} from './_components/location-header';
import { ProviderResultCard } from './_components/provider-result-card';
import { StatusBar } from 'expo-status-bar';

const RATING_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'All', value: undefined },
  { label: '★ 4.5 & up', value: 4.5 },
  { label: '★ 4.0 & up', value: 4 },
  { label: '★ 3.0 & up', value: 3 },
];

export function CustomerHomeScreen() {
  const router = useRouter();
  const userCoords = useLocationStore((state) => state.coords);
  const { data: customerProfile, isLoading: isCustomerProfileLoading } =
    useCustomerProfile();

  const locationHeaderRef = useRef<LocationHeaderHandle>(null);
  const searchInputRef = useRef<TextInputInstance>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [locationMode, setLocationMode] = useState<LocationMode>('city');
  const [searchEverywhere, setSearchEverywhere] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const debouncedSearch = useDebounce(searchInput.trim(), 350);

  const hasCity = SUPPORTED_CITIES.includes(
    customerProfile?.city as (typeof SUPPORTED_CITIES)[number],
  );
  const hasNearbyLocation = locationMode === 'nearby' && !!userCoords;
  const canBrowse =
    searchEverywhere ||
    (locationMode === 'city' && hasCity) ||
    (locationMode === 'nearby' && hasNearbyLocation);
  const locationLabel =
    locationMode === 'nearby'
      ? 'near you'
      : (customerProfile?.city ?? 'your area');

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: selectedCategory ?? undefined,
      minRating,
      city:
        !searchEverywhere && locationMode === 'city'
          ? (customerProfile?.city ?? undefined)
          : undefined,
      lat:
        !searchEverywhere && locationMode === 'nearby'
          ? userCoords?.lat
          : undefined,
      lng:
        !searchEverywhere && locationMode === 'nearby'
          ? userCoords?.lng
          : undefined,
    }),
    [
      debouncedSearch,
      selectedCategory,
      minRating,
      customerProfile?.city,
      locationMode,
      searchEverywhere,
      userCoords,
    ],
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
  } = useProviders(filters, canBrowse);

  const providers = useMemo(
    () => data?.pages.flatMap((page) => page.data ?? []) ?? [],
    [data],
  );

  const displayProviders = useMemo(() => {
    if (locationMode !== 'nearby' || !userCoords || searchEverywhere) {
      return providers;
    }

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
  }, [locationMode, providers, searchEverywhere, userCoords]);

  function getDistanceLabel(provider: ProviderProfile) {
    if (locationMode !== 'nearby' || searchEverywhere) return null;
    if (!userCoords || provider.latitude == null || provider.longitude == null)
      return null;
    const distance = calculateDistanceKm(
      userCoords.lat,
      userCoords.lng,
      provider.latitude,
      provider.longitude,
    );
    return `${distance.toFixed(1)} km`;
  }

  const hasActiveFilter =
    !!debouncedSearch ||
    selectedCategory !== null ||
    minRating !== undefined ||
    searchEverywhere;

  function clearFilters() {
    setSearchInput('');
    setSelectedCategory(null);
    setMinRating(undefined);
    setSearchEverywhere(false);
  }

  function searchAcrossNigeria() {
    setSearchEverywhere(true);
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            notificationsHref="/home/notifications"
            leadingContent={
              <LocationHeader
                ref={locationHeaderRef}
                mode={locationMode}
                onModeChange={setLocationMode}
              />
            }
          />

          <View className="mt-4 flex-row items-center gap-2">
            <View
              className={`flex-1 flex-row items-center gap-3 rounded-2xl border bg-white px-2 py-1 ${isSearchFocused ? 'border-[#4B2E46]' : 'border-[#ECE7E0]'}`}
            >
              <Ionicons
                name="search-outline"
                size={18}
                color={isSearchFocused ? '#4B2E46' : '#948F86'}
              />
              <TextInput
                ref={searchInputRef}
                placeholder="Find a hairdresser, barber, service..."
                placeholderTextColor="#948F86"
                value={searchInput}
                onChangeText={setSearchInput}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                returnKeyType="search"
                className="flex-1 text-[16px] text-[#26242A]"
                style={{ outlineWidth: 0 }}
              />
              {searchInput ? (
                <Pressable onPress={() => setSearchInput('')} hitSlop={10}>
                  <Ionicons name="close-circle" size={18} color="#948F86" />
                </Pressable>
              ) : null}
            </View>

            <Pressable
              onPress={() => setRatingModalVisible(true)}
              accessibilityRole="button"
              accessibilityLabel="Filter by rating"
              accessibilityState={{ selected: minRating !== undefined }}
              className="h-[48px] w-[48px] items-center justify-center rounded-2xl border border-[#ECE7E0] bg-white"
            >
              <Ionicons
                name="funnel-outline"
                size={20}
                color={minRating !== undefined ? '#4B2E46' : '#26242A'}
              />
              {minRating !== undefined ? (
                <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#4B2E46]" />
              ) : null}
            </Pressable>
          </View>

          <Text className="mt-5 font-bold text-base">I need</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-1 flex-none"
            contentContainerClassName="gap-2 pr-6"
          >
            <Chip
              compact
              label="All"
              selected={selectedCategory === null}
              onPress={() => setSelectedCategory(null)}
            />

            {CATEGORIES.map(({ value, label }) => (
              <Chip
                key={value}
                compact
                label={label}
                selected={selectedCategory === value}
                onPress={() => setSelectedCategory(value)}
              />
            ))}
          </ScrollView>

          <View className="mt-4 flex-1">
            {isCustomerProfileLoading ? (
              <ListSkeleton />
            ) : !canBrowse ? (
              <EmptyState
                message="Choose a city or use your current location to find providers."
                actionLabel="Set your location"
                onAction={() => locationHeaderRef.current?.open()}
              />
            ) : isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <View className="flex-1">
                <HomeListHeader
                  hasActiveFilter={hasActiveFilter}
                  locationLabel={
                    searchEverywhere ? 'all locations' : locationLabel
                  }
                />
                <FlatList
                  showsVerticalScrollIndicator={false}
                  data={displayProviders}
                  keyExtractor={(provider) => provider.id}
                  contentContainerClassName="grow gap-3 pb-32"
                  keyboardShouldPersistTaps="handled"
                  refreshing={isRefetching}
                  onRefresh={refetch}
                  onEndReached={() => {
                    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
                  }}
                  onEndReachedThreshold={0.5}
                  ListEmptyComponent={
                    <EmptyState
                      message={
                        searchEverywhere
                          ? 'No providers found. Try a different search or category.'
                          : `No providers found in ${customerProfile?.city ?? 'this area'}.`
                      }
                      actionLabel={
                        hasActiveFilter
                          ? 'Clear filters'
                          : 'Search across Nigeria'
                      }
                      onAction={
                        hasActiveFilter ? clearFilters : searchAcrossNigeria
                      }
                    />
                  }
                  ListFooterComponent={
                    isFetchingNextPage ? (
                      <ActivityIndicator className="mt-4" />
                    ) : undefined
                  }
                  renderItem={({ item }) => {
                    const distanceLabel = getDistanceLabel(item);
                    return (
                      <ProviderResultCard
                        provider={item}
                        distanceLabel={distanceLabel}
                        onPress={() =>
                          router.push({
                            pathname: '/provider/[id]',
                            params: { id: item.id },
                          })
                        }
                      />
                    );
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRatingModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setRatingModalVisible(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-center text-base font-bold text-[#26242A]">
              Filter by rating
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {RATING_OPTIONS.map((option) => (
                <Chip
                  key={option.label}
                  label={option.label}
                  selected={minRating === option.value}
                  onPress={() => setMinRating(option.value)}
                />
              ))}
            </View>
            <View className="mt-6">
              <Button
                label="Show results"
                onPress={() => setRatingModalVisible(false)}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
