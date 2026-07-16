import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import { SelectField } from '@/components/select-field';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '@/hooks/services/provider-services';
import { useUploadImage } from '@/hooks/services/uploads';
import { ADD_ONS, CATEGORIES, DURATION_OPTIONS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';
import { serviceSchema } from '@/validations/service';

export function ProviderServiceFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  useHideTabBar();

  const { data: services } = useServices();
  const existingService = services?.find((service) => service.id === id);

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const uploadImageMutation = useUploadImage();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [category, setCategory] = useState('');
  const [addOns, setAddOns] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [syncedServiceId, setSyncedServiceId] = useState<string | null>(null);

  if (existingService && existingService.id !== syncedServiceId) {
    setSyncedServiceId(existingService.id);
    setName(existingService.name);
    setDescription(existingService.description ?? '');
    setPrice(existingService.price);
    setDurationMinutes(String(existingService.durationMinutes));
    setCategory(existingService.category ?? '');
    setAddOns(existingService.addOns ?? []);
    setImageUrl(existingService.imageUrl ?? null);
  }

  const activeMutation = isEditing
    ? updateServiceMutation
    : createServiceMutation;

  async function handlePickPhoto() {
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
    if (uploadResponse.data) setImageUrl(uploadResponse.data.url);
  }

  function handleSave() {
    setFieldError(null);

    const result = serviceSchema.safeParse({
      name,
      description: description || undefined,
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      category: category || undefined,
      imageUrl: imageUrl || undefined,
      addOns: addOns.length ? addOns : undefined,
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    if (isEditing && id) {
      updateServiceMutation.mutate(
        { id, payload: result.data },
        { onSuccess: () => router.back() },
      );
    } else {
      createServiceMutation.mutate(result.data, {
        onSuccess: () => router.back(),
      });
    }
  }

  function handleDelete() {
    if (!id) return;
    deleteServiceMutation.mutate(id, { onSuccess: () => router.back() });
  }

  function handleReactivate() {
    if (!id) return;
    updateServiceMutation.mutate(
      { id, payload: { isActive: true } },
      { onSuccess: () => router.back() },
    );
  }

  const serverError = activeMutation.isError
    ? getErrorMessage(activeMutation.error)
    : null;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title={isEditing ? 'Edit service' : 'New service'}
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
            showNotifications={false}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32"
          >
            <Text className="mt-4 text-xs text-[#948F86]">Service photo</Text>
            <Pressable
              onPress={handlePickPhoto}
              className="mt-1 h-28 items-center justify-center overflow-hidden rounded-[16px] border border-dashed border-[#ECE7E0] bg-[#FAF8F4]"
            >
              {uploadImageMutation.isPending ? (
                <ActivityIndicator color="#4B2E46" />
              ) : imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={22} color="#4B2E46" />
                  <Text className="mt-1 text-[13px] font-bold text-[#4B2E46]">
                    Add photo
                  </Text>
                  <Text className="text-[11px] text-[#A8A39B]">
                    JPG, PNG up to 5MB
                  </Text>
                </>
              )}
            </Pressable>

            <TextInput
              placeholder="Service name"
              placeholderTextColor="#A8A39B"
              value={name}
              onChangeText={setName}
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Description (optional)"
              placeholderTextColor="#A8A39B"
              value={description}
              onChangeText={setDescription}
              multiline
              className="mt-3 min-h-[76px] rounded-[16px] border border-[#ECE7E0] bg-white px-5 py-4 text-[15px] text-[#26242A]"
              style={{ textAlignVertical: 'top', outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Price"
              placeholderTextColor="#A8A39B"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

            <View className="mt-3">
              <SelectField
                label="Duration"
                placeholder="Select duration"
                options={DURATION_OPTIONS}
                value={durationMinutes}
                onChange={setDurationMinutes}
              />
            </View>

            <View className="mt-3">
              <SelectField
                label="Category"
                placeholder="Select category"
                options={CATEGORIES}
                value={category}
                onChange={setCategory}
              />
            </View>

            <View className="mt-3">
              <SelectField
                label="Add-ons (optional)"
                placeholder="Select add-ons"
                options={ADD_ONS}
                value={addOns}
                onChange={setAddOns}
                multiple
              />
            </View>

            {(fieldError ?? serverError) ? (
              <Text className="mt-3 text-[13px] text-[#E5484D]">
                {fieldError ?? serverError}
              </Text>
            ) : null}

            <View className="mt-5">
              <Button
                label={activeMutation.isPending ? 'Saving…' : 'Save service'}
                onPress={handleSave}
                loading={activeMutation.isPending}
              />
            </View>

            {isEditing && existingService?.isActive ? (
              <Pressable
                onPress={handleDelete}
                disabled={deleteServiceMutation.isPending}
                className="mt-4 items-center"
              >
                <Text className="text-[13px] font-bold text-[#E5484D]">
                  {deleteServiceMutation.isPending
                    ? 'Removing…'
                    : 'Deactivate service'}
                </Text>
              </Pressable>
            ) : null}

            {isEditing && existingService && !existingService.isActive ? (
              <Pressable
                onPress={handleReactivate}
                disabled={updateServiceMutation.isPending}
                className="mt-4 items-center"
              >
                <Text className="text-[13px] font-bold text-[#4B2E46]">
                  Reactivate service
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
