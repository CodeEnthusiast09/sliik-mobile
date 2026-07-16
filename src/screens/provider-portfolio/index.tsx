import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import DraggableFlatList, {
  type RenderItemParams,
  ScaleDecorator,
} from 'react-native-draggable-flatlist';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { EmptyState } from '@/components/empty-state';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { SelectField } from '@/components/select-field';
import { ListSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useAddPortfolioItem,
  useDeletePortfolioItem,
  usePortfolio,
  useReorderPortfolio,
} from '@/hooks/services/portfolio';
import { useUploadImage } from '@/hooks/services/uploads';
import type { PortfolioItem } from '@/interfaces/provider';
import { CATEGORIES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';

type Mode = 'view' | 'reorder' | 'select';

function categoryLabel(category: string | null): string | null {
  return CATEGORIES.find((option) => option.value === category)?.label ?? category;
}

export function ProviderPortfolioScreen() {
  const router = useRouter();

  useHideTabBar();

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
  const reorderPortfolioMutation = useReorderPortfolio();

  const [mode, setMode] = useState<Mode>('view');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');

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
    if (uploadResponse.data) setPendingImageUrl(uploadResponse.data.url);
  }

  function handleCancelAdd() {
    setPendingImageUrl(null);
    setNewTitle('');
    setNewCategory('');
  }

  function handleConfirmAdd() {
    if (!pendingImageUrl || !newTitle || !newCategory) return;

    addPortfolioItemMutation.mutate(
      { imageUrl: pendingImageUrl, title: newTitle, category: newCategory },
      { onSuccess: handleCancelAdd },
    );
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

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function deleteSelected() {
    selectedIds.forEach((id) => deletePortfolioItemMutation.mutate(id));
    setSelectedIds([]);
    setMode('view');
  }

  function handleDeleteSelected() {
    if (Platform.OS === 'web') {
      if (
        window.confirm(
          `Remove ${selectedIds.length} photo(s)? This cannot be undone.`,
        )
      ) {
        deleteSelected();
      }
      return;
    }

    Alert.alert(
      `Remove ${selectedIds.length} photo(s)?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: deleteSelected },
      ],
    );
  }

  const isAdding =
    uploadImageMutation.isPending || addPortfolioItemMutation.isPending;
  const addError = uploadImageMutation.isError
    ? getErrorMessage(uploadImageMutation.error)
    : addPortfolioItemMutation.isError
      ? getErrorMessage(addPortfolioItemMutation.error)
      : null;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="My Portfolio"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
            showNotifications={false}
            rightAction={
              portfolio && portfolio.length > 1 ? (
                <Pressable
                  onPress={() =>
                    setMode((current) =>
                      current === 'reorder' ? 'view' : 'reorder',
                    )
                  }
                  hitSlop={10}
                >
                  <Text className="text-[13px] font-bold text-[#4B2E46]">
                    {mode === 'reorder' ? 'Done' : 'Reorder'}
                  </Text>
                </Pressable>
              ) : undefined
            }
          />

          <Text className="mt-2 text-[13px] text-[#817F80]">
            Showcase your best work. Clients book with their eyes.
          </Text>

          {mode === 'select' ? (
            <View className="mt-4 flex-row items-center gap-2">
              <Pressable
                onPress={() => {
                  setMode('view');
                  setSelectedIds([]);
                }}
                className="flex-1 items-center rounded-full border border-[#ECE7E0] py-2.5"
              >
                <Text className="text-[13px] font-bold text-[#26242A]">
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleDeleteSelected}
                disabled={selectedIds.length === 0}
                className={`flex-1 items-center rounded-full border border-[#E5484D] py-2.5 ${selectedIds.length === 0 ? 'opacity-50' : ''}`}
              >
                <Text className="text-[13px] font-bold text-[#E5484D]">
                  Delete{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-4 flex-row gap-2">
              <Pressable
                onPress={handleAddPhoto}
                disabled={isAdding || mode === 'reorder'}
                className={`flex-1 items-center rounded-full border border-[#4B2E46] py-2.5 ${isAdding || mode === 'reorder' ? 'opacity-50' : ''}`}
              >
                <Text className="text-[13px] font-bold text-[#4B2E46]">
                  {isAdding ? 'Adding…' : '+ Add photo'}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('select')}
                disabled={mode === 'reorder' || !portfolio?.length}
                className={`flex-1 items-center rounded-full border border-[#ECE7E0] py-2.5 ${mode === 'reorder' || !portfolio?.length ? 'opacity-50' : ''}`}
              >
                <Text className="text-[13px] font-bold text-[#26242A]">
                  Select
                </Text>
              </Pressable>
            </View>
          )}

          {addError ? (
            <Text className="mt-3 text-[13px] text-[#E5484D]">{addError}</Text>
          ) : null}

          <View className="mt-4 flex-1">
            {isLoading ? (
              <ListSkeleton />
            ) : isError ? (
              <ErrorState message={getErrorMessage(error)} onRetry={refetch} />
            ) : mode === 'reorder' ? (
              <DraggableFlatList
                data={portfolio ?? []}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) =>
                  reorderPortfolioMutation.mutate(data.map((item) => item.id))
                }
                contentContainerStyle={{ paddingBottom: 128, gap: 8 }}
                renderItem={({
                  item,
                  drag,
                  isActive,
                }: RenderItemParams<PortfolioItem>) => (
                  <ScaleDecorator>
                    <Pressable
                      onLongPress={drag}
                      disabled={isActive}
                      className={`flex-row items-center gap-3 rounded-[16px] border border-[#ECE7E0] bg-white p-2 ${isActive ? 'opacity-70' : ''}`}
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: 56, height: 56, borderRadius: 12 }}
                        contentFit="cover"
                      />
                      <View className="flex-1">
                        <Text
                          className="font-serif-bold text-[15px] text-[#26242A]"
                          numberOfLines={1}
                        >
                          {item.title ?? 'Untitled'}
                        </Text>
                        {item.category ? (
                          <Text className="text-[12px] text-[#817F80]">
                            {categoryLabel(item.category)}
                          </Text>
                        ) : null}
                      </View>
                      <Ionicons name="reorder-three" size={22} color="#A8A39B" />
                    </Pressable>
                  </ScaleDecorator>
                )}
              />
            ) : (
              <FlatList
                showsVerticalScrollIndicator={false}
                data={portfolio}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperClassName="gap-2"
                contentContainerClassName="grow gap-2 pb-32"
                refreshing={isRefetching}
                onRefresh={refetch}
                ListEmptyComponent={
                  <EmptyState message="No portfolio photos yet. Add some to showcase your work." />
                }
                renderItem={({ item }) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <Pressable
                      onPress={() =>
                        mode === 'select'
                          ? toggleSelected(item.id)
                          : handleRemove(item.id)
                      }
                      className="aspect-square flex-1 overflow-hidden rounded-[16px]"
                    >
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                      />
                      <View className="absolute inset-x-0 bottom-0 gap-0.5 bg-black/50 px-2.5 py-2">
                        {item.title ? (
                          <Text
                            className="text-[13px] font-bold text-white"
                            numberOfLines={1}
                          >
                            {item.title}
                          </Text>
                        ) : null}
                        {item.category ? (
                          <Text
                            className="text-[11px] text-white/80"
                            numberOfLines={1}
                          >
                            {categoryLabel(item.category)}
                          </Text>
                        ) : null}
                      </View>

                      <View className="absolute right-2 top-2">
                        {mode === 'select' ? (
                          <View
                            className={`h-6 w-6 items-center justify-center rounded-full border-2 border-white ${isSelected ? 'bg-[#4B2E46]' : 'bg-black/30'}`}
                          >
                            {isSelected ? (
                              <Ionicons name="checkmark" size={14} color="#fff" />
                            ) : null}
                          </View>
                        ) : (
                          <View className="h-6 w-6 items-center justify-center rounded-full bg-white">
                            <Ionicons
                              name="remove-circle"
                              size={22}
                              color="#E5484D"
                            />
                          </View>
                        )}
                      </View>
                    </Pressable>
                  );
                }}
              />
            )}
          </View>

          <View className="mb-4 flex-row items-start gap-2 rounded-[16px] bg-[#EAF2FF] p-3">
            <Ionicons name="information-circle" size={18} color="#3B6FD1" />
            <Text className="flex-1 text-[12px] text-[#3B5D8A]">
              Tip: Great portfolios get more bookings{'\n'}High quality photos
              • Good lighting • Variety
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        visible={!!pendingImageUrl}
        transparent
        animationType="slide"
        onRequestClose={handleCancelAdd}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={handleCancelAdd}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-center text-base font-bold text-[#26242A]">
              Add to portfolio
            </Text>

            {pendingImageUrl ? (
              <Image
                source={{ uri: pendingImageUrl }}
                style={{ width: '100%', height: 160, borderRadius: 16 }}
                contentFit="cover"
              />
            ) : null}

            <TextInput
              placeholder="Title (e.g. Soft Glam)"
              placeholderTextColor="#A8A39B"
              value={newTitle}
              onChangeText={setNewTitle}
              className="mt-4 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

            <View className="mt-3">
              <SelectField
                label="Category"
                placeholder="Select category"
                options={CATEGORIES}
                value={newCategory}
                onChange={setNewCategory}
              />
            </View>

            <View className="mt-5">
              <Button
                label={
                  addPortfolioItemMutation.isPending
                    ? 'Adding…'
                    : 'Add to portfolio'
                }
                onPress={handleConfirmAdd}
                loading={addPortfolioItemMutation.isPending}
                disabled={!newTitle || !newCategory}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
