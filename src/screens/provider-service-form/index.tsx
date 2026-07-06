import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { ScreenHeader } from '@/components/screen-header';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '@/hooks/services/provider-services';
import { getErrorMessage } from '@/lib/utils';
import { serviceSchema } from '@/validations/service';

export function ProviderServiceFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const { data: services } = useServices();
  const existingService = services?.find((service) => service.id === id);

  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [syncedServiceId, setSyncedServiceId] = useState<string | null>(null);

  if (existingService && existingService.id !== syncedServiceId) {
    setSyncedServiceId(existingService.id);
    setName(existingService.name);
    setDescription(existingService.description ?? '');
    setPrice(existingService.price);
    setDurationMinutes(String(existingService.durationMinutes));
  }

  const activeMutation = isEditing
    ? updateServiceMutation
    : createServiceMutation;

  function handleSave() {
    setFieldError(null);

    const result = serviceSchema.safeParse({
      name,
      description: description || undefined,
      price: Number(price),
      durationMinutes: Number(durationMinutes),
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
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title={isEditing ? 'Edit service' : 'New service'}
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32"
          >
            <TextInput
              placeholder="Service name"
              placeholderTextColor="#A8A39B"
              value={name}
              onChangeText={setName}
              className="mt-4 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
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
            <TextInput
              placeholder="Duration (minutes)"
              placeholderTextColor="#A8A39B"
              value={durationMinutes}
              onChangeText={setDurationMinutes}
              keyboardType="number-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

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
