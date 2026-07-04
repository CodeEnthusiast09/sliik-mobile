import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { ThemedView } from '@/components/themed-view';
import { useCreateOffer } from '@/hooks/services/offers';
import { useCustomerProfile } from '@/hooks/services/customer';
import { getErrorMessage } from '@/lib/utils';
import { createOfferSchema } from '@/validations/offer';

import { styles } from './index.styles';

export function OfferNewScreen() {
  const router = useRouter();
  const { data: customer } = useCustomerProfile();
  const createOfferMutation = useCreateOffer();

  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');
  const [city, setCity] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [syncedCustomerId, setSyncedCustomerId] = useState<string | null>(null);

  if (customer && customer.id !== syncedCustomerId) {
    setSyncedCustomerId(customer.id);
    setCity(customer.city ?? '');
  }

  function handleSubmit() {
    setFieldError(null);

    const result = createOfferSchema.safeParse({
      serviceType,
      description,
      budget: budget ? Number(budget) : undefined,
      preferredFrom: fromDate && fromTime ? `${fromDate}T${fromTime}:00.000Z` : '',
      preferredTo: toDate && toTime ? `${toDate}T${toTime}:00.000Z` : '',
      city,
    });

    if (!result.success) {
      setFieldError(result.error.issues[0]?.message ?? 'Invalid input');
      return;
    }

    createOfferMutation.mutate(result.data, { onSuccess: () => router.back() });
  }

  const serverError = createOfferMutation.isError
    ? getErrorMessage(createOfferMutation.error)
    : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText type="link">{'< Back'}</ThemedText>
        </Pressable>

        <ThemedText type="title" style={styles.title}>
          Post an offer
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Leave budget blank for an open request - providers compete on price.
        </ThemedText>

        <ThemedTextInput
          placeholder="Service (e.g. hairdresser, barber)"
          value={serviceType}
          onChangeText={setServiceType}
          style={styles.input}
        />
        <ThemedTextInput
          placeholder="Describe what you need"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.descriptionInput]}
          multiline
        />
        <ThemedTextInput
          placeholder="Budget (optional)"
          value={budget}
          onChangeText={setBudget}
          style={styles.input}
          keyboardType="decimal-pad"
        />
        <ThemedTextInput placeholder="City" value={city} onChangeText={setCity} style={styles.input} />

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Preferred window
        </ThemedText>
        <ThemedView style={styles.row}>
          <ThemedTextInput
            placeholder="From date (YYYY-MM-DD)"
            value={fromDate}
            onChangeText={setFromDate}
            style={[styles.input, styles.rowInput]}
          />
          <ThemedTextInput
            placeholder="From time (HH:MM)"
            value={fromTime}
            onChangeText={setFromTime}
            style={[styles.input, styles.rowInput]}
          />
        </ThemedView>
        <ThemedView style={styles.row}>
          <ThemedTextInput
            placeholder="To date (YYYY-MM-DD)"
            value={toDate}
            onChangeText={setToDate}
            style={[styles.input, styles.rowInput]}
          />
          <ThemedTextInput
            placeholder="To time (HH:MM)"
            value={toTime}
            onChangeText={setToTime}
            style={[styles.input, styles.rowInput]}
          />
        </ThemedView>

        {(fieldError ?? serverError) && (
          <ThemedText type="small" themeColor="danger" style={styles.error}>
            {fieldError ?? serverError}
          </ThemedText>
        )}

        <Pressable onPress={handleSubmit} disabled={createOfferMutation.isPending}>
          <ThemedView type="backgroundElement" style={styles.submitButton}>
            <ThemedText type="smallBold">
              {createOfferMutation.isPending ? 'Posting...' : 'Post offer'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}
