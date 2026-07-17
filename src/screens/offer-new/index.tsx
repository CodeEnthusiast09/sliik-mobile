import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { z } from 'zod';

import { Button } from '@/components/button';
import { ControlledDateTimeField } from '@/components/controlled-date-time-field';
import { ControlledTextInput } from '@/components/controlled-text-input';
import { ScreenHeader } from '@/components/screen-header';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useCustomerProfile } from '@/hooks/services/customer';
import { useCreateOffer } from '@/hooks/services/offers';
import { useUploadImage } from '@/hooks/services/uploads';
import { firstFormError, getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import {
  createOfferFormSchema,
  type CreateOfferFormInput,
} from '@/validations/offer';

import { FieldCard } from './_components/field-card';

type OfferPayload = z.output<typeof createOfferFormSchema>;

export function OfferNewScreen() {
  const router = useRouter();

  useHideTabBar();

  const { data: customer } = useCustomerProfile();
  const createOfferMutation = useCreateOffer();
  const uploadImageMutation = useUploadImage();

  const { control, handleSubmit, setValue } = useForm<
    CreateOfferFormInput,
    unknown,
    OfferPayload
  >({
    resolver: zodResolver(createOfferFormSchema),
    defaultValues: {
      serviceType: '',
      description: '',
      budget: '',
      preferredDateTime: '',
      city: '',
      referenceImageUrl: '',
    },
  });

  const description = useWatch({ control, name: 'description' }) ?? '';
  const referenceImageUrl = useWatch({ control, name: 'referenceImageUrl' });

  // Prefill the city from the customer's profile once it loads. Keyed on the
  // customer id so it doesn't clobber a city the user has since edited.
  const customerId = customer?.id;
  const customerCity = customer?.city ?? '';
  useEffect(() => {
    if (customerId) setValue('city', customerCity);
  }, [customerId, customerCity, setValue]);

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
      setValue('referenceImageUrl', uploadResponse.data.url);
    }
  }

  function onValid(data: OfferPayload) {
    createOfferMutation.mutate(data, {
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
            showNotifications={false}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <Text className="mt-4 text-[14px] text-[#817F80]">
              Tell us what you need. Providers will apply.
            </Text>

            <FieldCard label="Service type">
              <ControlledTextInput
                control={control}
                name="serviceType"
                placeholder="E.g. Soft glam, sleek ponytail"
                placeholderTextColor="#A8A39B"
                className="text-[15px] text-[#26242A]"
                style={{ outlineWidth: 0 }}
              />
            </FieldCard>

            <FieldCard label="Describe what you need">
              <ControlledTextInput
                control={control}
                name="description"
                placeholder="E.g. Soft glam for wedding guest"
                placeholderTextColor="#A8A39B"
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
                <ControlledTextInput
                  control={control}
                  name="budget"
                  placeholder="E.g. 20,000"
                  placeholderTextColor="#A8A39B"
                  keyboardType="decimal-pad"
                  className="flex-1 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
              </View>
            </FieldCard>

            <FieldCard label="Preferred date & time">
              <View className="flex-row items-center gap-2">
                <Ionicons name="calendar-outline" size={16} color="#817F80" />
                <View className="flex-1">
                  <ControlledDateTimeField
                    control={control}
                    name="preferredDateTime"
                    mode="datetime"
                    bare
                    placeholder="Select date & time"
                  />
                </View>
              </View>
            </FieldCard>

            <FieldCard label="City">
              <View className="flex-row items-center gap-2">
                <Ionicons name="location-outline" size={16} color="#817F80" />
                <ControlledTextInput
                  control={control}
                  name="city"
                  placeholder="Select your city"
                  placeholderTextColor="#A8A39B"
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
                onPress={handleSubmit(onValid, (errors) =>
                  showToast(firstFormError(errors) ?? 'Invalid input', 'error'),
                )}
                loading={createOfferMutation.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
