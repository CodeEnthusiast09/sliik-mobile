import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { DateTimeField } from '@/components/date-time-field';
import { ScreenHeader } from '@/components/screen-header';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useCustomerProfile } from '@/hooks/services/customer';
import { useCreateOffer } from '@/hooks/services/offers';
import { useUploadImage } from '@/hooks/services/uploads';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { createOfferSchema } from '@/validations/offer';

export function OfferNewScreen() {
  const router = useRouter();

  useHideTabBar();

  const { data: customer } = useCustomerProfile();
  const createOfferMutation = useCreateOffer();
  const uploadImageMutation = useUploadImage();

  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toDate, setToDate] = useState('');
  const [toTime, setToTime] = useState('');
  const [city, setCity] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [syncedCustomerId, setSyncedCustomerId] = useState<string | null>(null);

  if (customer && customer.id !== syncedCustomerId) {
    setSyncedCustomerId(customer.id);
    setCity(customer.city ?? '');
  }

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
    if (uploadResponse.data) {
      setReferenceImageUrl(uploadResponse.data.url);
    }
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
      referenceImageUrl: referenceImageUrl || undefined,
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
    <View className="flex-1 bg-white">
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

            {referenceImageUrl ? (
              <Pressable
                onPress={handlePickPhoto}
                disabled={uploadImageMutation.isPending}
                className="mt-3 h-36 overflow-hidden rounded-[16px]"
              >
                <Image
                  source={{ uri: referenceImageUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
                <View className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1">
                  <Text className="text-[11px] font-bold text-white">
                    Change
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={handlePickPhoto}
                disabled={uploadImageMutation.isPending}
                className="mt-3 h-24 flex-row items-center justify-center gap-2 rounded-[16px] border border-dashed border-[#D8D2C8]"
              >
                <Ionicons name="camera-outline" size={18} color="#948F86" />
                <Text className="text-[14px] text-[#817F80]">
                  {uploadImageMutation.isPending
                    ? 'Uploading…'
                    : 'Add a reference photo (optional)'}
                </Text>
              </Pressable>
            )}
            {uploadImageMutation.isError ? (
              <Text className="mt-2 text-[13px] text-[#E5484D]">
                {getErrorMessage(uploadImageMutation.error)}
              </Text>
            ) : null}

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
