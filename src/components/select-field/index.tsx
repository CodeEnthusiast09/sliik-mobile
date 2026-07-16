import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';

export type SelectOption = { value: string; label: string };

type SingleSelectFieldProps = {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
};

type MultiSelectFieldProps = {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export type SelectFieldProps = (SingleSelectFieldProps | MultiSelectFieldProps) & {
  label: string;
  placeholder: string;
  options: SelectOption[];
};

export function SelectField(props: SelectFieldProps) {
  const { label, placeholder, options } = props;
  const [modalVisible, setModalVisible] = useState(false);

  const selectedValues = props.multiple
    ? props.value
    : props.value
      ? [props.value]
      : [];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);

  function handleSelect(optionValue: string) {
    if (props.multiple) {
      const next = props.value.includes(optionValue)
        ? props.value.filter((value) => value !== optionValue)
        : [...props.value, optionValue];
      props.onChange(next);
      return;
    }

    props.onChange(optionValue);
    setModalVisible(false);
  }

  return (
    <View>
      <Text className="text-xs text-[#948F86]">{label}</Text>
      <Pressable
        onPress={() => setModalVisible(true)}
        className="mt-1 flex-row items-center justify-between rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5"
      >
        <Text
          className={`text-[15px] ${selectedLabels.length ? 'text-[#26242A]' : 'text-[#A8A39B]'}`}
        >
          {selectedLabels.length ? selectedLabels.join(', ') : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#948F86" />
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
              {label}
            </Text>

            <View className="flex-row flex-wrap gap-2">
              {options.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={selectedValues.includes(option.value)}
                  onPress={() => handleSelect(option.value)}
                />
              ))}
            </View>

            {props.multiple ? (
              <View className="mt-6">
                <Button label="Done" onPress={() => setModalVisible(false)} />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
