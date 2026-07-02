import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '@/hooks/services/provider-services';
import { getErrorMessage } from '@/lib/utils';
import { serviceSchema } from '@/validations/service';

import { styles } from './index.styles';

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

  const activeMutation = isEditing ? updateServiceMutation : createServiceMutation;

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
      updateServiceMutation.mutate({ id, payload: result.data }, { onSuccess: () => router.back() });
    } else {
      createServiceMutation.mutate(result.data, { onSuccess: () => router.back() });
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

  const serverError = activeMutation.isError ? getErrorMessage(activeMutation.error) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          {isEditing ? 'Edit service' : 'New service'}
        </ThemedText>

        <TextInput placeholder="Service name" value={name} onChangeText={setName} style={styles.input} />
        <TextInput
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.descriptionInput]}
          multiline
        />
        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          style={styles.input}
          keyboardType="decimal-pad"
        />
        <TextInput
          placeholder="Duration (minutes)"
          value={durationMinutes}
          onChangeText={setDurationMinutes}
          style={styles.input}
          keyboardType="number-pad"
        />

        {(fieldError ?? serverError) && (
          <ThemedText type="small" style={styles.error}>
            {fieldError ?? serverError}
          </ThemedText>
        )}

        <Pressable onPress={handleSave} disabled={activeMutation.isPending}>
          <ThemedView type="backgroundElement" style={styles.submitButton}>
            <ThemedText type="smallBold">
              {activeMutation.isPending ? 'Saving...' : 'Save service'}
            </ThemedText>
          </ThemedView>
        </Pressable>

        {isEditing && existingService?.isActive && (
          <Pressable onPress={handleDelete} disabled={deleteServiceMutation.isPending}>
            <ThemedText type="small" style={styles.deleteText}>
              {deleteServiceMutation.isPending ? 'Removing...' : 'Deactivate service'}
            </ThemedText>
          </Pressable>
        )}

        {isEditing && existingService && !existingService.isActive && (
          <Pressable onPress={handleReactivate} disabled={updateServiceMutation.isPending}>
            <ThemedText type="small" style={styles.reactivateText}>
              Reactivate service
            </ThemedText>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}
