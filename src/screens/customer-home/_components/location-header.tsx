import Ionicons from '@expo/vector-icons/Ionicons';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/button';
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '@/hooks/services/customer';
import { SUPPORTED_CITIES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/utils';
import { useLocationStore } from '@/store/location';

export type LocationMode = 'city' | 'nearby';

export type LocationHeaderHandle = {
  open: () => void;
};

export const LocationHeader = forwardRef<
  LocationHeaderHandle,
  { mode: LocationMode; onModeChange: (mode: LocationMode) => void }
>(function LocationHeader({ mode, onModeChange }, ref) {
  const { data: customerProfile } = useCustomerProfile();
  const updateProfileMutation = useUpdateCustomerProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  useImperativeHandle(ref, () => ({ open: openModal }));

  function openModal() {
    setSelectedCity(
      SUPPORTED_CITIES.includes(
        customerProfile?.city as (typeof SUPPORTED_CITIES)[number],
      )
        ? (customerProfile?.city ?? '')
        : '',
    );
    setModalVisible(true);
  }

  function handleSave() {
    if (!selectedCity) return;
    updateProfileMutation.mutate(
      { city: selectedCity },
      {
        onSuccess: () => {
          onModeChange('city');
          setModalVisible(false);
        },
      },
    );
  }

  async function handleUseCurrentLocation() {
    setIsLocating(true);
    const success = await useLocationStore.getState().requestLocation(true);
    setIsLocating(false);
    if (!success) return;

    onModeChange('nearby');
    setModalVisible(false);
  }

  const hasSupportedCity = SUPPORTED_CITIES.includes(
    customerProfile?.city as (typeof SUPPORTED_CITIES)[number],
  );
  const locationLabel =
    mode === 'nearby'
      ? 'Near me'
      : hasSupportedCity && customerProfile?.city
        ? `${customerProfile.city}, Nigeria`
        : 'Set your location';

  return (
    <>
      <Pressable
        onPress={openModal}
        className="flex-row items-center gap-1"
        hitSlop={10}
      >
        <Ionicons name="location" size={16} color="#4B2E46" />
        <Text
          className="max-w-[180px] text-[15px] font-bold text-[#26242A]"
          numberOfLines={1}
        >
          {locationLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color="#948F86" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="rounded-t-3xl bg-white px-6 pb-10 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="mb-4 text-center text-base font-bold text-[#26242A]">
              Your location
            </Text>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => onModeChange('city')}
                accessibilityRole="radio"
                accessibilityState={{ selected: mode === 'city' }}
                className={`flex-1 rounded-2xl border p-3 ${mode === 'city' ? 'border-[#4B2E46] bg-[#F6EEF3]' : 'border-[#ECE7E0] bg-white'}`}
              >
                <Ionicons name="business-outline" size={20} color="#4B2E46" />
                <Text className="mt-2 text-[13px] font-bold text-[#26242A]">
                  Choose a city
                </Text>
              </Pressable>
              <Pressable
                onPress={() => void handleUseCurrentLocation()}
                disabled={isLocating}
                accessibilityRole="button"
                className={`flex-1 rounded-2xl border border-[#ECE7E0] bg-white p-3 ${isLocating ? 'opacity-50' : ''}`}
              >
                <Ionicons name="navigate-outline" size={20} color="#4B2E46" />
                <Text className="mt-2 text-[13px] font-bold text-[#26242A]">
                  {isLocating ? 'Locating…' : 'Use my location'}
                </Text>
              </Pressable>
            </View>
            <Text className="mt-5 text-xs text-[#948F86]">City</Text>
            <ScrollView
              className="mt-1 max-h-64"
              showsVerticalScrollIndicator={false}
            >
              <View className="gap-2">
                {SUPPORTED_CITIES.map((city) => {
                  const selected = selectedCity === city;
                  return (
                    <Pressable
                      key={city}
                      onPress={() => setSelectedCity(city)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className={`flex-row items-center justify-between rounded-2xl border px-4 py-3.5 ${selected ? 'border-[#4B2E46] bg-[#F6EEF3]' : 'border-[#ECE7E0] bg-white'}`}
                    >
                      <Text
                        className={`text-[15px] ${selected ? 'font-bold text-[#4B2E46]' : 'text-[#26242A]'}`}
                      >
                        {city}
                      </Text>
                      {selected ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4B2E46"
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
            {updateProfileMutation.isError ? (
              <Text className="mt-2 text-[12px] text-[#E5484D]">
                {getErrorMessage(updateProfileMutation.error)}
              </Text>
            ) : null}
            <View className="mt-5">
              <Button
                label={updateProfileMutation.isPending ? 'Saving…' : 'Save'}
                onPress={handleSave}
                loading={updateProfileMutation.isPending}
                disabled={!selectedCity}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
});
