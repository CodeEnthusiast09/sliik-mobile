import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { z } from 'zod';

import { Button } from '@/components/button';
import { ControlledSelectField } from '@/components/controlled-select-field';
import { ControlledTextInput } from '@/components/controlled-text-input';
import { ScreenHeader } from '@/components/screen-header';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '@/hooks/services/provider-services';
import { useUploadImage } from '@/hooks/services/uploads';
import { ADD_ONS, CATEGORIES, DURATION_OPTIONS } from '@/lib/constants';
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { serviceSchema } from '@/validations/service';

type ServiceFormInput = z.input<typeof serviceSchema>;
type ServiceFormOutput = z.output<typeof serviceSchema>;

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

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ServiceFormInput, unknown, ServiceFormOutput>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      durationMinutes: '',
      category: '',
      imageUrl: '',
      addOns: [],
    },
    // Prefill on edit. RHF re-syncs when `existingService` arrives from the
    // query and leaves user edits untouched afterwards, so no manual sync guard.
    values: existingService
      ? {
          name: existingService.name,
          description: existingService.description ?? '',
          price: existingService.price,
          durationMinutes: String(existingService.durationMinutes),
          category: existingService.category ?? '',
          imageUrl: existingService.imageUrl ?? '',
          addOns: existingService.addOns ?? [],
        }
      : undefined,
  });

  const imageUrl = useWatch({ control, name: 'imageUrl' });

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
    if (uploadResponse.data) setValue('imageUrl', uploadResponse.data.url);
  }

  function onValid(data: ServiceFormOutput) {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      price: data.price,
      durationMinutes: data.durationMinutes,
      category: data.category || undefined,
      imageUrl: data.imageUrl || undefined,
      addOns: data.addOns?.length ? data.addOns : undefined,
    };

    if (isEditing && id) {
      updateServiceMutation.mutate(
        { id, payload },
        { onSuccess: () => router.back() },
      );
    } else {
      createServiceMutation.mutate(payload, {
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
  const formError = firstFormError(errors);

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

            <ControlledTextInput
              control={control}
              name="name"
              placeholder="Service name"
              placeholderTextColor="#A8A39B"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <ControlledTextInput
              control={control}
              name="description"
              placeholder="Description (optional)"
              placeholderTextColor="#A8A39B"
              multiline
              className="mt-3 min-h-[76px] rounded-[16px] border border-[#ECE7E0] bg-white px-5 py-4 text-[15px] text-[#26242A]"
              style={{ textAlignVertical: 'top', outlineWidth: 0 }}
            />
            <ControlledTextInput
              control={control}
              name="price"
              placeholder="Price"
              placeholderTextColor="#A8A39B"
              keyboardType="decimal-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

            <View className="mt-3">
              <ControlledSelectField
                control={control}
                name="durationMinutes"
                label="Duration"
                placeholder="Select duration"
                options={DURATION_OPTIONS}
              />
            </View>

            <View className="mt-3">
              <ControlledSelectField
                control={control}
                name="category"
                label="Category"
                placeholder="Select category"
                options={CATEGORIES}
              />
            </View>

            <View className="mt-3">
              <ControlledSelectField
                control={control}
                name="addOns"
                label="Add-ons (optional)"
                placeholder="Select add-ons"
                options={ADD_ONS}
                multiple
              />
            </View>

            {(formError ?? serverError) ? (
              <Text className="mt-3 text-[13px] text-[#E5484D]">
                {formError ?? serverError}
              </Text>
            ) : null}

            <View className="mt-5">
              <Button
                label={activeMutation.isPending ? 'Saving…' : 'Save service'}
                onPress={handleSubmit(onValid)}
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
