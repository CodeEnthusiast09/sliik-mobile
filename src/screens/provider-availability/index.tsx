import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  useAddDayOff,
  useDaysOff,
  useRemoveDayOff,
  useSchedule,
  useSetSchedule,
} from '@/hooks/services/availability';
import { getErrorMessage } from '@/lib/utils';
import { addDayOffSchema, setScheduleSchema } from '@/validations/availability';

import { styles } from './index.styles';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface DayRow {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

function buildDefaultRows(): DayRow[] {
  return DAY_LABELS.map((_, dayOfWeek) => ({
    dayOfWeek,
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
  }));
}

export function ProviderAvailabilityScreen() {
  const { data: schedule, isLoading: isLoadingSchedule } = useSchedule();
  const { data: daysOff, isLoading: isLoadingDaysOff } = useDaysOff();
  const setScheduleMutation = useSetSchedule();
  const addDayOffMutation = useAddDayOff();
  const removeDayOffMutation = useRemoveDayOff();

  const [rows, setRows] = useState<DayRow[]>(buildDefaultRows());
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [dayOffDate, setDayOffDate] = useState('');
  const [dayOffReason, setDayOffReason] = useState('');
  const [dayOffError, setDayOffError] = useState<string | null>(null);
  const [hasSyncedSchedule, setHasSyncedSchedule] = useState(false);

  if (schedule && !hasSyncedSchedule) {
    setHasSyncedSchedule(true);
    setRows((current) =>
      current.map((row) => {
        const match = schedule.find((slot) => slot.dayOfWeek === row.dayOfWeek);
        // Postgres' `time` column serializes as HH:MM:SS; the form only edits HH:MM.
        return match
          ? {
              ...row,
              enabled: true,
              startTime: match.startTime.slice(0, 5),
              endTime: match.endTime.slice(0, 5),
            }
          : { ...row, enabled: false };
      }),
    );
  }

  function toggleDay(dayOfWeek: number, enabled: boolean) {
    setRows((current) =>
      current.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, enabled } : row)),
    );
  }

  function updateDayTime(dayOfWeek: number, field: 'startTime' | 'endTime', value: string) {
    setRows((current) =>
      current.map((row) => (row.dayOfWeek === dayOfWeek ? { ...row, [field]: value } : row)),
    );
  }

  function handleSaveSchedule() {
    setScheduleError(null);

    const slots = rows
      .filter((row) => row.enabled)
      .map((row) => ({ dayOfWeek: row.dayOfWeek, startTime: row.startTime, endTime: row.endTime }));

    const result = setScheduleSchema.safeParse({ slots });
    if (!result.success) {
      setScheduleError(result.error.issues[0]?.message ?? 'Invalid schedule');
      return;
    }

    setScheduleMutation.mutate(result.data);
  }

  function handleAddDayOff() {
    setDayOffError(null);

    const result = addDayOffSchema.safeParse({
      date: dayOffDate,
      reason: dayOffReason || undefined,
    });
    if (!result.success) {
      setDayOffError(result.error.issues[0]?.message ?? 'Invalid date');
      return;
    }

    addDayOffMutation.mutate(result.data, {
      onSuccess: () => {
        setDayOffDate('');
        setDayOffReason('');
      },
    });
  }

  const scheduleServerError = setScheduleMutation.isError
    ? getErrorMessage(setScheduleMutation.error)
    : null;
  const dayOffServerError = addDayOffMutation.isError
    ? getErrorMessage(addDayOffMutation.error)
    : null;

  if (isLoadingSchedule || isLoadingDaysOff) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedText type="title">Availability</ThemedText>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Weekly schedule
          </ThemedText>
          {rows.map((row) => (
            <ThemedView key={row.dayOfWeek} type="backgroundElement" style={styles.dayRow}>
              <View style={styles.dayRowHeader}>
                <ThemedText type="default">{DAY_LABELS[row.dayOfWeek]}</ThemedText>
                <Switch value={row.enabled} onValueChange={(value) => toggleDay(row.dayOfWeek, value)} />
              </View>
              {row.enabled && (
                <View style={styles.timeRow}>
                  <TextInput
                    value={row.startTime}
                    onChangeText={(value) => updateDayTime(row.dayOfWeek, 'startTime', value)}
                    style={[styles.input, styles.timeInput]}
                    placeholder="09:00"
                  />
                  <ThemedText type="default">to</ThemedText>
                  <TextInput
                    value={row.endTime}
                    onChangeText={(value) => updateDayTime(row.dayOfWeek, 'endTime', value)}
                    style={[styles.input, styles.timeInput]}
                    placeholder="17:00"
                  />
                </View>
              )}
            </ThemedView>
          ))}

          {(scheduleError ?? scheduleServerError) && (
            <ThemedText type="small" style={styles.error}>
              {scheduleError ?? scheduleServerError}
            </ThemedText>
          )}

          <Pressable onPress={handleSaveSchedule} disabled={setScheduleMutation.isPending}>
            <ThemedView type="backgroundElement" style={styles.submitButton}>
              <ThemedText type="smallBold">
                {setScheduleMutation.isPending ? 'Saving...' : 'Save schedule'}
              </ThemedText>
            </ThemedView>
          </Pressable>

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Days off
          </ThemedText>

          {daysOff?.map((dayOff) => (
            <ThemedView key={dayOff.id} type="backgroundElement" style={styles.dayOffRow}>
              <View style={styles.dayOffInfo}>
                <ThemedText type="default">{dayOff.date}</ThemedText>
                {dayOff.reason && (
                  <ThemedText type="small" themeColor="textSecondary">
                    {dayOff.reason}
                  </ThemedText>
                )}
              </View>
              <Pressable onPress={() => removeDayOffMutation.mutate(dayOff.id)}>
                <ThemedText type="small" style={styles.removeText}>
                  Remove
                </ThemedText>
              </Pressable>
            </ThemedView>
          ))}
          {daysOff?.length === 0 && (
            <ThemedText type="small" themeColor="textSecondary">
              No upcoming days off.
            </ThemedText>
          )}

          <TextInput
            placeholder="Date (YYYY-MM-DD)"
            value={dayOffDate}
            onChangeText={setDayOffDate}
            style={styles.input}
          />
          <TextInput
            placeholder="Reason (optional)"
            value={dayOffReason}
            onChangeText={setDayOffReason}
            style={styles.input}
          />

          {(dayOffError ?? dayOffServerError) && (
            <ThemedText type="small" style={styles.error}>
              {dayOffError ?? dayOffServerError}
            </ThemedText>
          )}

          <Pressable onPress={handleAddDayOff} disabled={addDayOffMutation.isPending}>
            <ThemedView type="backgroundElement" style={styles.submitButton}>
              <ThemedText type="smallBold">
                {addDayOffMutation.isPending ? 'Adding...' : 'Add day off'}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
