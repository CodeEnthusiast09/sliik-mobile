import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/button';
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '@/hooks/services/customer';

export function LocationHeader() {
  const { data: customerProfile } = useCustomerProfile();
  const updateProfileMutation = useUpdateCustomerProfile();
  const [modalVisible, setModalVisible] = useState(false);
  const [cityInput, setCityInput] = useState('');

  function openModal() {
    setCityInput(customerProfile?.city ?? '');
    setModalVisible(true);
  }

  function handleSave() {
    const city = cityInput.trim();
    if (!city) return;
    updateProfileMutation.mutate(
      { city },
      { onSuccess: () => setModalVisible(false) },
    );
  }

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
          {customerProfile?.city ? `${customerProfile.city}, Nigeria` : 'Set your location'}
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
            <Text className="text-xs text-[#948F86]">City</Text>
            <TextInput
              placeholder="e.g. Lekki, Lagos"
              placeholderTextColor="#A8A39B"
              value={cityInput}
              onChangeText={setCityInput}
              className="mt-1 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />
            <View className="mt-5">
              <Button
                label={updateProfileMutation.isPending ? 'Saving…' : 'Save'}
                onPress={handleSave}
                loading={updateProfileMutation.isPending}
                disabled={!cityInput.trim()}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
