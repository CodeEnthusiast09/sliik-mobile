import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { DateTimeField } from '@/components/date-time-field';
import { ScreenHeader } from '@/components/screen-header';
import { useCreateDeal } from '@/hooks/services/deals';
import { useServices } from '@/hooks/services/provider-services';
import { getErrorMessage } from '@/lib/utils';
import { showToast } from '@/store/toast';
import { createDealSchema } from '@/validations/deal';

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

  const activeServices = services?.filter((service) => service.isActive) ?? [];

  function handleSelectService(id: string, price: string) {
    setServiceId(id);
    if (!originalPrice) setOriginalPrice(price);
  }

  function handleSubmit() {
    const result = createDealSchema.safeParse({
      serviceId: serviceId ?? '',
      title,
      description: description || undefined,
      originalPrice: Number(originalPrice),
      dealPrice: Number(dealPrice),
      slotsTotal: Number(slotsTotal),
      expiresAt:
        expiresDate && expiresTime
          ? `${expiresDate}T${expiresTime}:00.000Z`
          : '',
    });

    if (!result.success) {
      showToast(result.error.issues[0]?.message ?? 'Invalid input', 'error');
      return;
    }

    createDealMutation.mutate(result.data, {
      onSuccess: () => router.back(),
      onError: (err) => showToast(getErrorMessage(err), 'error'),
    });
  }

  return (
    <View className="flex-1 bg-[#FBF8F3]">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="New deal"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-8"
          >
            <Text className="mt-5 font-serif-bold text-[18px] text-[#26242A]">
              Which service?
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mt-3 h-11 flex-none"
              contentContainerClassName="items-center gap-2 pr-6"
            >
              {activeServices.map((service) => (
                <Chip
                  key={service.id}
                  label={service.name}
                  selected={serviceId === service.id}
                  onPress={() => handleSelectService(service.id, service.price)}
                />
              ))}
              {activeServices.length === 0 ? (
                <Text className="text-[14px] text-[#817F80]">
                  Add a service first before creating a deal.
                </Text>
              ) : null}
            </ScrollView>

            <TextInput
              placeholder="Deal title"
              placeholderTextColor="#A8A39B"
              value={title}
              onChangeText={setTitle}
              className="mt-5 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
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
              placeholder="Original price"
              placeholderTextColor="#A8A39B"
              value={originalPrice}
              onChangeText={setOriginalPrice}
              keyboardType="decimal-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Deal price"
              placeholderTextColor="#A8A39B"
              value={dealPrice}
              onChangeText={setDealPrice}
              keyboardType="decimal-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <TextInput
              placeholder="Number of slots"
              placeholderTextColor="#A8A39B"
              value={slotsTotal}
              onChangeText={setSlotsTotal}
              keyboardType="number-pad"
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Expires
            </Text>
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1" style={{ minWidth: 0 }}>
                <DateTimeField
                  mode="date"
                  placeholder="Date"
                  value={expiresDate}
                  onChangeValue={setExpiresDate}
                />
              </View>
              <View className="flex-1" style={{ minWidth: 0 }}>
                <DateTimeField
                  mode="time"
                  placeholder="Time"
                  value={expiresTime}
                  onChangeValue={setExpiresTime}
                />
              </View>
            </View>

            <View className="mt-7">
              <Button
                label={createDealMutation.isPending ? 'Posting…' : 'Post deal'}
                onPress={handleSubmit}
                loading={createDealMutation.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
