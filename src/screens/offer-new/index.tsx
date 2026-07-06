import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { DateTimeField } from '@/components/date-time-field';
import { ScreenHeader } from '@/components/screen-header';
import { useCustomerProfile } from '@/hooks/services/customer';
import { useCreateOffer } from '@/hooks/services/offers';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { createOfferSchema } from '@/validations/offer';

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
  const [syncedCustomerId, setSyncedCustomerId] = useState<string | null>(null);

  if (customer && customer.id !== syncedCustomerId) {
    setSyncedCustomerId(customer.id);
    setCity(customer.city ?? '');
  }

  function handleSubmit() {
    const result = createOfferSchema.safeParse({
      serviceType,
      description,
      budget: budget ? Number(budget) : undefined,
      preferredFrom:
        fromDate && fromTime ? `${fromDate}T${fromTime}:00.000Z` : '',
      preferredTo: toDate && toTime ? `${toDate}T${toTime}:00.000Z` : '',
      city,
    });

    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? 'Invalid input', 'error');
      return;
    }

    createOfferMutation.mutate(result.data, {
      onSuccess: () => router.back(),
      onError: (err) => showToast(getErrorMessage(err), 'error'),
    });
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Post an offer"
            notificationsHref="/home/notifications"
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <Text className="mt-4 text-[14px] text-[#817F80]">
              Leave budget blank for an open request - providers compete on
              price.
            </Text>

            <TextInput
              placeholder="Service (e.g. hairdresser, barber)"
              placeholderTextColor="#A8A39B"
              value={serviceType}
              onChangeText={setServiceType}
              className="mt-5 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Describe what you need"
              placeholderTextColor="#A8A39B"
              value={description}
              onChangeText={setDescription}
              multiline
              className="mt-3 min-h-[76px] rounded-[16px] border border-[#ECE7E0] bg-white px-5 py-4 text-[15px] text-[#26242A]"
              style={{ textAlignVertical: 'top', outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Budget (optional)"
              placeholderTextColor="#A8A39B"
              value={budget}
              onChangeText={setBudget}
              keyboardType="decimal-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="City"
              placeholderTextColor="#A8A39B"
              value={city}
              onChangeText={setCity}
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Preferred window
            </Text>
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1" style={{ minWidth: 0 }}>
                <DateTimeField
                  mode="date"
                  placeholder="From date"
                  value={fromDate}
                  onChangeValue={setFromDate}
                />
              </View>
              <View className="flex-1" style={{ minWidth: 0 }}>
                <DateTimeField
                  mode="time"
                  placeholder="From time"
                  value={fromTime}
                  onChangeValue={setFromTime}
                />
              </View>
            </View>
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1" style={{ minWidth: 0 }}>
                <DateTimeField
                  mode="date"
                  placeholder="To date"
                  value={toDate}
                  onChangeValue={setToDate}
                />
              </View>
              <View className="flex-1" style={{ minWidth: 0 }}>
                <DateTimeField
                  mode="time"
                  placeholder="To time"
                  value={toTime}
                  onChangeValue={setToTime}
                />
              </View>
            </View>

            <View className="mt-7">
              <Button
                label={
                  createOfferMutation.isPending ? 'Posting…' : 'Post offer'
                }
                onPress={handleSubmit}
                loading={createOfferMutation.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
