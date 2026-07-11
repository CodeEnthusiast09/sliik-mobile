import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
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
import { useDebounce } from '@/hooks/common/use-debounce';
import { useProviders } from '@/hooks/services/discovery';
import type { ProviderProfile } from '@/interfaces/provider';
import {
  calculateDistanceKm,
  formatTradeTypeLabel,
  getErrorMessage,
} from '@/lib/utils';
import { useLocationStore } from '@/store/location';

const RATING_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: 'All', value: undefined },
  { label: '★ 4.5 & up', value: 4.5 },
  { label: '★ 4.0 & up', value: 4 },
  { label: '★ 3.0 & up', value: 3 },
];

// Curated top-line categories shown as their own chip - the mock's
// Hair/Nails/Barbers/Makeup. Everything else, current or future, collapses
// into "More" so the row never grows unbounded.
const PINNED_TRADE_TYPES: { value: string; label: string }[] = [
  { value: 'hairdresser', label: 'Hair' },
  { value: 'nail-tech', label: 'Nails' },
  { value: 'barber', label: 'Barbers' },
  { value: 'makeup-artist', label: 'Makeup' },
];
const PINNED_TRADE_TYPE_VALUES = new Set(
  PINNED_TRADE_TYPES.map((option) => option.value),
);

export function CustomerHomeScreen() {
  const router = useRouter();
  const userCoords = useLocationStore((state) => state.coords);

  // requestLocation() normally fires right after login/register, but an
  // already-logged-in session (persisted token, no fresh auth event) would
  // otherwise never trigger it - ask here too so distance still works.
  // requestLocation() itself guards against asking more than once.
  useEffect(() => {
    useLocationStore.getState().requestLocation();
  }, []);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput.trim(), 350);
  const [selectedTradeType, setSelectedTradeType] = useState<string | null>(
    null,
  );
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [moreModalVisible, setMoreModalVisible] = useState(false);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      tradeType: selectedTradeType ?? undefined,
      minRating,
      lat: userCoords?.lat,
      lng: userCoords?.lng,
    }),
    [debouncedSearch, selectedTradeType, minRating, userCoords],
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

  const overflowTradeTypes = useMemo(
    () =>
      tradeTypeOptions.filter(
        (tradeType) => !PINNED_TRADE_TYPE_VALUES.has(tradeType),
      ),
    [tradeTypeOptions],
  );

  const isOverflowTradeTypeSelected =
    selectedTradeType !== null &&
    !PINNED_TRADE_TYPE_VALUES.has(selectedTradeType);

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
    return `${distance.toFixed(1)} km`;
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader notificationsHref="/home/notifications" />

          <View className="mt-1 flex-row items-center gap-3 rounded-2xl border border-[#ECE7E0] bg-white px-2.5 py-4">
            <Ionicons name="search-outline" size={18} color="#948F86" />
            <TextInput
              placeholder="Find a hairdressser, barber, nail tech..."
              placeholderTextColor="#948F86"
              value={searchInput}
              onChangeText={setSearchInput}
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

          <Text className='mt-5 font-bold text-base'>I need</Text>

          <View className="mt-1 h-11 flex-none flex-row items-center justify-between">
            <Chip
              compact
              label="All"
              selected={selectedTradeType === null}
              onPress={() => setSelectedTradeType(null)}
            />

            {PINNED_TRADE_TYPES.map(({ value, label }) => (
              <Chip
                key={value}
                compact
                label={label}
                selected={selectedTradeType === value}
                onPress={() => setSelectedTradeType(value)}
              />
            ))}

            {overflowTradeTypes.length > 0 ? (
              <Chip
                compact
                label="More"
                selected={isOverflowTradeTypeSelected}
                onPress={() => setMoreModalVisible(true)}
                icon={
                  <Ionicons
                    name="chevron-down"
                    size={12}
                    color={isOverflowTradeTypeSelected ? '#4B2E46' : '#26242A'}
                  />
                }
              />
            ) : null}
          </View>

          <Text className='mt-5 font-bold text-base'>Top rated</Text>

          <View className="mt-3 h-11 flex-none flex-row items-center justify-between">
            {RATING_OPTIONS.map((option) => (
              <Chip
                key={option.label}
                label={option.label}
                selected={minRating === option.value}
                onPress={() => setMinRating(option.value)}
              />
            ))}
          </View>

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
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
                          <Text
                            className="flex-1 font-serif-bold text-[16px] text-[#26242A]"
                            numberOfLines={1}
                          >
                            {item.fullName}
                          </Text>
                          {item.totalReviews > 0 ? (
                            <Text className="text-[13px] font-bold text-[#26242A]">
                              ★ {rating.toFixed(1)}
                            </Text>
                          ) : null}
                        </View>
                        <Text className="text-[13px] text-[#817F80]">
                          {formatTradeTypeLabel(item.tradeType)}
                        </Text>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center gap-1">
                            <Ionicons
                              name="location-outline"
                              size={14}
                              color="#948F86"
                            />
                            <Text className="text-[13px] text-[#817F80]">
                              {item.city ?? 'Location not set'}, Nigeria
                            </Text>
                          </View>
                          {distanceLabel ? (
                            <Text className="text-[13px] text-[#817F80]">
                              {distanceLabel}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={moreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMoreModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setMoreModalVisible(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-center text-base font-bold text-[#26242A]">
              More categories
            </Text>
            {overflowTradeTypes.map((tradeType) => {
              const active = selectedTradeType === tradeType;
              return (
                <Pressable
                  key={tradeType}
                  className={`flex-row items-center justify-between rounded-xl px-3 py-3 ${active ? 'bg-[#4B2E4620]' : ''}`}
                  onPress={() => {
                    setSelectedTradeType(tradeType);
                    setMoreModalVisible(false);
                  }}
                >
                  <Text
                    className={`text-[15px] font-semibold ${active ? 'text-[#4B2E46]' : 'text-[#26242A]'}`}
                  >
                    {formatTradeTypeLabel(tradeType)}
                  </Text>
                  {active ? (
                    <Ionicons name="checkmark" size={18} color="#4B2E46" />
                  ) : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
