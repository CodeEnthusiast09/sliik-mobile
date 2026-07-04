import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useCreateDeal } from '@/hooks/services/deals';
import { useServices } from '@/hooks/services/provider-services';
import { getErrorMessage } from '@/lib/utils';
import { createDealSchema } from '@/validations/deal';

import { styles } from './index.styles';

export function DealNewScreen() {
  const router = useRouter();
  const { data: services } = useServices();
  const createDealMutation = useCreateDeal();

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [slotsTotal, setSlotsTotal] = useState('');
  const [expiresDate, setExpiresDate] = useState('');
  const [expiresTime, setExpiresTime] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const activeServices = services?.filter((service) => service.isActive) ?? [];

  function handleSelectService(id: string, price: string) {
    setServiceId(id);
    if (!originalPrice) setOriginalPrice(price);
  }

  function handleSubmit() {
    setFieldError(null);

    const result = createDealSchema.safeParse({
      serviceId: serviceId ?? '',
      title,
      description: description || undefined,
      originalPrice: Number(originalPrice),
      dealPrice: Number(dealPrice),
      slotsTotal: Number(slotsTotal),
      expiresAt: expiresDate && expiresTime ? `${expiresDate}T${expiresTime}:00.000Z` : '',
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    createDealMutation.mutate(result.data, { onSuccess: () => router.back() });
  }

  const serverError = createDealMutation.isError ? getErrorMessage(createDealMutation.error) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title" style={styles.title}>
            New deal
          </ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Which service?
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {activeServices.map((service) => (
              <Pressable key={service.id} onPress={() => handleSelectService(service.id, service.price)}>
                <ThemedView
                  type={serviceId === service.id ? 'backgroundSelected' : 'backgroundElement'}
                  style={styles.chip}
                >
                  <ThemedText type="small">{service.name}</ThemedText>
                </ThemedView>
              </Pressable>
            ))}
            {activeServices.length === 0 && (
              <ThemedText type="small" themeColor="textSecondary">
                Add a service first before creating a deal.
              </ThemedText>
            )}
          </ScrollView>

          <ThemedTextInput placeholder="Deal title" value={title} onChangeText={setTitle} style={styles.input} />
          <ThemedTextInput
            placeholder="Description (optional)"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.descriptionInput]}
            multiline
          />
          <ThemedTextInput
            placeholder="Original price"
            value={originalPrice}
            onChangeText={setOriginalPrice}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <ThemedTextInput
            placeholder="Deal price"
            value={dealPrice}
            onChangeText={setDealPrice}
            style={styles.input}
            keyboardType="decimal-pad"
          />
          <ThemedTextInput
            placeholder="Number of slots"
            value={slotsTotal}
            onChangeText={setSlotsTotal}
            style={styles.input}
            keyboardType="number-pad"
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Expires
          </ThemedText>
          <ThemedView style={styles.row}>
            <ThemedTextInput
              placeholder="Date (YYYY-MM-DD)"
              value={expiresDate}
              onChangeText={setExpiresDate}
              style={[styles.input, styles.rowInput]}
            />
            <ThemedTextInput
              placeholder="Time (HH:MM)"
              value={expiresTime}
              onChangeText={setExpiresTime}
              style={[styles.input, styles.rowInput]}
            />
          </ThemedView>

          {(fieldError ?? serverError) && (
            <ThemedText type="small" themeColor="danger" style={styles.error}>
              {fieldError ?? serverError}
            </ThemedText>
          )}

          <Pressable onPress={handleSubmit} disabled={createDealMutation.isPending}>
            <ThemedView type="backgroundElement" style={styles.submitButton}>
              <ThemedText type="smallBold">
                {createDealMutation.isPending ? 'Posting...' : 'Post deal'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
