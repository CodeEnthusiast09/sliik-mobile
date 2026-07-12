import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { type ReactNode, useState } from 'react';
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

const PREFERRED_WINDOW_MS = 60 * 60 * 1000;

function FieldCard({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View className="mt-3 gap-2 rounded-[16px] border border-[#ECE7E0] bg-white p-4">
      <Text className="text-[13px] font-bold text-[#26242A]">{label}</Text>
      {children}
    </View>
  );
}

export function OfferNewScreen() {
  const router = useRouter();

  useHideTabBar();

  const { data: customer } = useCustomerProfile();
  const createOfferMutation = useCreateOffer();
  const uploadImageMutation = useUploadImage();

  const [serviceType, setServiceType] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [preferredDateTime, setPreferredDateTime] = useState('');
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
    let preferredFrom = '';
    let preferredTo = '';
    if (preferredDateTime) {
      const from = new Date(`${preferredDateTime}:00`);
      preferredFrom = from.toISOString();
      preferredTo = new Date(from.getTime() + PREFERRED_WINDOW_MS).toISOString();
    }

    const result = createOfferSchema.safeParse({
      serviceType,
      description,
      budget: budget ? Number(budget) : undefined,
      preferredFrom,
      preferredTo,
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
              Tell us what you need. Helpers will apply.
            </Text>

            <FieldCard label="Service type">
              <TextInput
                placeholder="E.g. Soft glam, sleek ponytail"
                placeholderTextColor="#A8A39B"
                value={serviceType}
                onChangeText={setServiceType}
                className="text-[15px] text-[#26242A]"
                style={{ outlineWidth: 0 }}
              />
            </FieldCard>

            <FieldCard label="Describe what you need">
              <TextInput
                placeholder="E.g. Soft glam for wedding guest"
                placeholderTextColor="#A8A39B"
                value={description}
                onChangeText={setDescription}
                multiline
                maxLength={300}
                className="min-h-[60px] text-[15px] text-[#26242A]"
                style={{ textAlignVertical: 'top', outlineWidth: 0 }}
              />
              <Text className="text-right text-[12px] text-[#A8A39B]">
                {description.length}/300
              </Text>
            </FieldCard>

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

            <FieldCard label="Budget (optional)">
              <View className="flex-row items-center gap-2">
                <Text className="text-[15px] font-medium text-[#26242A]">
                  ₦
                </Text>
                <View className="h-4 w-px bg-[#ECE7E0]" />
                <TextInput
                  placeholder="E.g. 20,000"
                  placeholderTextColor="#A8A39B"
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                  className="flex-1 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
              </View>
            </FieldCard>
            <Text className="mt-1.5 px-1 text-[12px] text-[#817F80]">
              Optional: Leave blank to get open offers, or set a budget.
            </Text>

            <FieldCard label="Preferred date & time">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={16} color="#817F80" />
                <View className="flex-1">
                  <DateTimeField
                    mode="datetime"
                    bare
                    placeholder="Select date & time"
                    value={preferredDateTime}
                    onChangeValue={setPreferredDateTime}
                  />
                </View>
              </View>
            </FieldCard>

            <FieldCard label="City">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={16} color="#817F80" />
                <TextInput
                  placeholder="Select your city"
                  placeholderTextColor="#A8A39B"
                  value={city}
                  onChangeText={setCity}
                  className="flex-1 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
              </View>
            </FieldCard>

            <View className="mt-4 flex-row gap-3 rounded-[16px] bg-[#4B2E4614] p-4">
              <View className="mt-0.5 h-4 w-4 items-center justify-center rounded-full bg-[#4B2E46]">
                <Ionicons name="information" size={11} color="#F7EFE4" />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[13px] font-bold text-[#4B2E46]">
                  Open request or fixed budget?
                </Text>
                <Text className="text-[13px] text-[#4B2E46]">
                  Add a budget to get precise offers, or leave it blank to
                  receive a range of offers.
                </Text>
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
