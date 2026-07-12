import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput } from 'react-native';

export type DateTimeFieldMode = 'date' | 'time' | 'datetime';

export type DateTimeFieldProps = {
  mode: DateTimeFieldMode;
  value: string;
  onChangeValue: (value: string) => void;
  placeholder: string;
  /** Strips the field's own border/background/padding so a parent card can supply it. */
  bare?: boolean;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function parseValue(mode: DateTimeFieldMode, value: string): Date {
  if (mode === 'datetime' && value) {
    const parsed = new Date(`${value}:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
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

function formatValue(mode: DateTimeFieldMode, date: Date): string {
  if (mode === 'datetime') {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  if (mode === 'date') return date.toISOString().slice(0, 10);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function displayLabel(mode: DateTimeFieldMode, value: string): string {
  const date = parseValue(mode, value);
  if (mode === 'datetime') {
    return `${date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })} • ${date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  }
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
  bare = false,
}: DateTimeFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  // Android's native picker has no combined date+time dialog (unlike iOS's
  // own 'datetime' mode) - 'datetime' mode on Android chains a date dialog
  // into a time dialog instead, tracked by this step.
  const [androidStep, setAndroidStep] = useState<'date' | 'time' | null>(
    null,
  );

  if (Platform.OS === 'web') {
    return (
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A8A39B"
        value={value}
        onChangeText={onChangeValue}
        className={
          bare
            ? 'text-[15px] text-[#26242A]'
            : 'rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]'
        }
        style={{ outlineWidth: 0 }}
      />
    );
  }

  const isAndroidDateTime = mode === 'datetime' && Platform.OS === 'android';

  return (
    <>
      <Pressable
        onPress={() =>
          isAndroidDateTime ? setAndroidStep('date') : setShowPicker(true)
        }
        className={
          bare
            ? 'justify-center'
            : 'justify-center rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5'
        }
      >
        <Text
          className={`text-[15px] ${value ? 'text-[#26242A]' : 'text-[#A8A39B]'}`}
        >
          {value ? displayLabel(mode, value) : placeholder}
        </Text>
      </Pressable>

      {showPicker && !isAndroidDateTime ? (
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

      {isAndroidDateTime && androidStep === 'date' ? (
        <DateTimePicker
          value={parseValue('datetime', value)}
          mode="date"
          onValueChange={(_event, pickedDate) => {
            const prev = parseValue('datetime', value);
            const combined = new Date(pickedDate);
            combined.setHours(prev.getHours(), prev.getMinutes(), 0, 0);
            onChangeValue(formatValue('datetime', combined));
            setAndroidStep('time');
          }}
          onDismiss={() => setAndroidStep(null)}
        />
      ) : null}

      {isAndroidDateTime && androidStep === 'time' ? (
        <DateTimePicker
          value={parseValue('datetime', value)}
          mode="time"
          onValueChange={(_event, pickedTime) => {
            const prev = parseValue('datetime', value);
            const combined = new Date(prev);
            combined.setHours(
              pickedTime.getHours(),
              pickedTime.getMinutes(),
              0,
              0,
            );
            onChangeValue(formatValue('datetime', combined));
            setAndroidStep(null);
          }}
          onDismiss={() => setAndroidStep(null)}
        />
      ) : null}
    </>
  );
}
