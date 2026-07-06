import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput } from 'react-native';

export type DateTimeFieldProps = {
  mode: 'date' | 'time';
  value: string;
  onChangeValue: (value: string) => void;
  placeholder: string;
};

function parseValue(mode: 'date' | 'time', value: string): Date {
  if (mode === 'date' && value) {
    const parsed = new Date(`${value}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (mode === 'time' && value) {
    const [hours, minutes] = value.split(':').map(Number);
    if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  }
  return new Date();
}

function formatValue(mode: 'date' | 'time', date: Date): string {
  if (mode === 'date') return date.toISOString().slice(0, 10);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function displayLabel(mode: 'date' | 'time', value: string): string {
  const date = parseValue(mode, value);
  if (mode === 'date') {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

// @react-native-community/datetimepicker has no web implementation at all
// (native-only, iOS/Android/Windows) - web keeps the plain text input as a
// graceful fallback, same pattern already used for Alert.alert/SecureStore.
export function DateTimeField({
  mode,
  value,
  onChangeValue,
  placeholder,
}: DateTimeFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A8A39B"
        value={value}
        onChangeText={onChangeValue}
        className="rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
        style={{ outlineWidth: 0 }}
      />
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setShowPicker(true)}
        className="justify-center rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5"
      >
        <Text
          className={`text-[15px] ${value ? 'text-[#26242A]' : 'text-[#A8A39B]'}`}
        >
          {value ? displayLabel(mode, value) : placeholder}
        </Text>
      </Pressable>
      {showPicker ? (
        <DateTimePicker
          value={parseValue(mode, value)}
          mode={mode}
          onValueChange={(_event, date) => {
            setShowPicker(false);
            onChangeValue(formatValue(mode, date));
          }}
          onDismiss={() => setShowPicker(false)}
        />
      ) : null}
    </>
  );
}
