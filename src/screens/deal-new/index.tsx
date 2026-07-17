import Ionicons from '@expo/vector-icons/Ionicons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { z } from 'zod';

import { Button } from '@/components/button';
import { ControlledDateTimeField } from '@/components/controlled-date-time-field';
import { ControlledTextInput } from '@/components/controlled-text-input';
import { ScreenHeader } from '@/components/screen-header';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import { useCreateDeal } from '@/hooks/services/deals';
import { useServices } from '@/hooks/services/provider-services';
import type { Service } from '@/interfaces/provider';
import {
  calculateDiscountPercent,
  firstFormError,
  formatCurrency,
  formatDurationLabel,
  getErrorMessage,
} from '@/lib/utils';
import { showToast } from '@/store/toast';
import { createDealFormSchema, type CreateDealFormInput } from '@/validations/deal';

const TITLE_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 120;

type DealPayload = z.output<typeof createDealFormSchema>;

export function DealNewScreen() {
  const router = useRouter();

  useHideTabBar();

  const { data: services } = useServices();
  const createDealMutation = useCreateDeal();

  const { control, handleSubmit, setValue } = useForm<
    CreateDealFormInput,
    unknown,
    DealPayload
  >({
    resolver: zodResolver(createDealFormSchema),
    defaultValues: {
      serviceId: '',
      title: '',
      description: '',
      originalPrice: '',
      dealPrice: '',
      slotsTotal: '',
      startsAt: '',
      expiresAt: '',
    },
  });

  const [serviceModalVisible, setServiceModalVisible] = useState(false);

  const serviceId = useWatch({ control, name: 'serviceId' });
  const title = useWatch({ control, name: 'title' }) ?? '';
  const description = useWatch({ control, name: 'description' }) ?? '';
  const originalPrice = useWatch({ control, name: 'originalPrice' });
  const dealPrice = useWatch({ control, name: 'dealPrice' });

  const selectedService = services?.find((service) => service.id === serviceId);
  const activeServices = services?.filter((service) => service.isActive) ?? [];
  const discountPercent =
    Number(originalPrice) > 0 && Number(dealPrice) > 0
      ? calculateDiscountPercent(Number(originalPrice), Number(dealPrice))
      : null;

  function handleSelectService(service: Service) {
    setValue('serviceId', service.id);
    if (!originalPrice) setValue('originalPrice', service.price);
    setServiceModalVisible(false);
  }

  function onValid(data: DealPayload) {
    createDealMutation.mutate(data, {
      onSuccess: () => router.back(),
      onError: (err) => showToast(getErrorMessage(err), 'error'),
    });
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="New deal"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />
          <Text className="mt-1 text-[13px] text-[#817F80]">
            Create a special offer to attract more clients.
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <Text className="mt-5 text-xs text-[#948F86]">Which service?</Text>
            {selectedService ? (
              <View className="mt-1 flex-row items-center gap-3 rounded-[16px] border border-[#ECE7E0] bg-white p-3">
                <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-[12px] bg-[#F3F0EB]">
                  {selectedService.imageUrl ? (
                    <Image
                      source={{ uri: selectedService.imageUrl }}
                      style={{ width: 56, height: 56 }}
                      contentFit="cover"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={20} color="#A8A39B" />
                  )}
                </View>
                <View className="flex-1 gap-0.5">
                  <Text
                    className="font-serif-bold text-[15px] text-[#26242A]"
                    numberOfLines={1}
                  >
                    {selectedService.name}
                  </Text>
                  <Text className="text-[12px] text-[#817F80]">
                    {formatDurationLabel(selectedService.durationMinutes)} · ₦
                    {formatCurrency(selectedService.price)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setValue('serviceId', '')}
                  hitSlop={10}
                >
                  <Ionicons name="close-circle" size={20} color="#A8A39B" />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setServiceModalVisible(true)}
                className="mt-1 flex-row items-center justify-between rounded-[16px] border border-dashed border-[#ECE7E0] bg-[#FAF8F4] px-4 py-3.5"
              >
                <Text className="text-[15px] text-[#A8A39B]">
                  {activeServices.length === 0
                    ? 'Add a service first before creating a deal'
                    : 'Select a service'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#948F86" />
              </Pressable>
            )}

            <View className="mt-4">
              <ControlledTextInput
                control={control}
                name="title"
                placeholder="Deal title"
                placeholderTextColor="#A8A39B"
                maxLength={TITLE_MAX_LENGTH}
                className="rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                style={{ outlineWidth: 0 }}
              />
              <Text className="mt-1 text-right text-[11px] text-[#A8A39B]">
                {title.length}/{TITLE_MAX_LENGTH}
              </Text>
            </View>

            <View className="-mt-2">
              <ControlledTextInput
                control={control}
                name="description"
                placeholder="Description (optional)"
                placeholderTextColor="#A8A39B"
                maxLength={DESCRIPTION_MAX_LENGTH}
                multiline
                className="min-h-[76px] rounded-[16px] border border-[#ECE7E0] bg-white px-5 py-4 text-[15px] text-[#26242A]"
                style={{ textAlignVertical: 'top', outlineWidth: 0 }}
              />
              <Text className="mt-1 text-right text-[11px] text-[#A8A39B]">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </Text>
            </View>

            <View className="-mt-2 flex-row gap-3">
              <View className="flex-1" style={{ minWidth: 0 }}>
                <Text className="text-xs text-[#948F86]">Offer price</Text>
                <ControlledTextInput
                  control={control}
                  name="dealPrice"
                  placeholder="0"
                  placeholderTextColor="#A8A39B"
                  keyboardType="decimal-pad"
                  className="mt-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
              </View>
              <View className="flex-1" style={{ minWidth: 0 }}>
                <Text className="text-xs text-[#948F86]">Original price</Text>
                <ControlledTextInput
                  control={control}
                  name="originalPrice"
                  placeholder="0"
                  placeholderTextColor="#A8A39B"
                  keyboardType="decimal-pad"
                  className="mt-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                  style={{ outlineWidth: 0 }}
                />
              </View>
            </View>

            {discountPercent !== null ? (
              <View className="mt-2 flex-row items-center gap-2">
                <View className="rounded-md bg-[#4B2E461A] px-2 py-1">
                  <Text className="text-[11px] font-bold text-[#4B2E46]">
                    {discountPercent}% OFF
                  </Text>
                </View>
                <Text className="text-[11px] text-[#817F80]">
                  This is the discount shown to clients.
                </Text>
              </View>
            ) : null}

            <View className="mt-3">
              <Text className="text-xs text-[#948F86]">Slots available</Text>
              <ControlledTextInput
                control={control}
                name="slotsTotal"
                placeholder="e.g. 10"
                placeholderTextColor="#A8A39B"
                keyboardType="number-pad"
                className="mt-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
                style={{ outlineWidth: 0 }}
              />
              <Text className="mt-1 text-[11px] text-[#817F80]">
                Total bookings allowed for this deal.
              </Text>
            </View>

            <View className="mt-4 gap-3">
              <View>
                <Text className="text-xs text-[#948F86]">
                  Deal starts (optional)
                </Text>
                <View className="mt-1">
                  <ControlledDateTimeField
                    control={control}
                    name="startsAt"
                    mode="datetime"
                    placeholder="Goes live immediately"
                  />
                </View>
              </View>
              <View>
                <Text className="text-xs text-[#948F86]">Deal expires</Text>
                <View className="mt-1">
                  <ControlledDateTimeField
                    control={control}
                    name="expiresAt"
                    mode="datetime"
                    placeholder="Select date & time"
                  />
                </View>
              </View>
            </View>

            <View className="mt-7">
              <Button
                label={
                  createDealMutation.isPending ? 'Publishing…' : 'Publish deal'
                }
                onPress={handleSubmit(onValid, (errors) =>
                  showToast(firstFormError(errors) ?? 'Invalid input', 'error'),
                )}
                loading={createDealMutation.isPending}
              />
              <View className="mt-2 flex-row items-center justify-center gap-1">
                <Ionicons name="lock-closed" size={12} color="#817F80" />
                <Text className="text-[12px] text-[#817F80]">
                  Your deal will go live and be visible to clients.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

        <Modal
          visible={serviceModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setServiceModalVisible(false)}
        >
          <Pressable
            className="flex-1 justify-end bg-black/40"
            onPress={() => setServiceModalVisible(false)}
          >
            <Pressable
              className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
              onPress={(event) => event.stopPropagation()}
            >
              <Text className="mb-4 text-center text-base font-bold text-[#26242A]">
                Select a service
              </Text>

              {activeServices.length === 0 ? (
                <Text className="py-4 text-center text-[13px] text-[#817F80]">
                  Add a service first before creating a deal.
                </Text>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={{ maxHeight: 360 }}
                >
                  {activeServices.map((service) => (
                    <Pressable
                      key={service.id}
                      onPress={() => handleSelectService(service)}
                      className="flex-row items-center gap-3 border-b border-[#ECE7E0] py-3"
                    >
                      <View className="h-12 w-12 items-center justify-center overflow-hidden rounded-[10px] bg-[#F3F0EB]">
                        {service.imageUrl ? (
                          <Image
                            source={{ uri: service.imageUrl }}
                            style={{ width: 48, height: 48 }}
                            contentFit="cover"
                          />
                        ) : (
                          <Ionicons
                            name="image-outline"
                            size={18}
                            color="#A8A39B"
                          />
                        )}
                      </View>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-[14px] font-semibold text-[#26242A]">
                          {service.name}
                        </Text>
                        <Text className="text-[12px] text-[#817F80]">
                          {formatDurationLabel(service.durationMinutes)} · ₦
                          {formatCurrency(service.price)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
