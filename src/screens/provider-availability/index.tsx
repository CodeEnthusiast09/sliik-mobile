import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { DateTimeField } from '@/components/date-time-field';
import { ErrorState } from '@/components/error-state';
import { ScreenHeader } from '@/components/screen-header';
import { DetailSkeleton } from '@/components/skeleton';
import { useHideTabBar } from '@/hooks/common/use-hide-tab-bar';
import {
  useAddDayOff,
  useDaysOff,
  useRemoveDayOff,
  useSchedule,
  useSetSchedule,
} from '@/hooks/services/availability';
import { getErrorMessage } from '@/lib/utils';
import { addDayOffSchema, setScheduleSchema } from '@/validations/availability';

const DAY_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

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
  const router = useRouter();

  useHideTabBar();

  const {
    data: schedule,
    isLoading: isLoadingSchedule,
    isError: isScheduleError,
    error: scheduleFetchError,
    refetch: refetchSchedule,
  } = useSchedule();
  const {
    data: daysOff,
    isLoading: isLoadingDaysOff,
    isError: isDaysOffError,
    error: daysOffFetchError,
    refetch: refetchDaysOff,
  } = useDaysOff();
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

  if (isScheduleError || isDaysOffError) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <ErrorState
              message={getErrorMessage(scheduleFetchError ?? daysOffFetchError)}
              onRetry={() => {
                refetchSchedule();
                refetchDaysOff();
              }}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (isLoadingSchedule || isLoadingDaysOff) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-1 px-6">
            <DetailSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 px-6">
          <ScreenHeader
            title="Availability"
            notificationsHref="/profile/notifications"
            onBack={() => router.back()}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-32"
          >
            <Text className="mt-3 font-serif-bold text-[18px] text-[#26242A]">
              Weekly schedule
            </Text>

            <View className="mt-3 gap-2">
              {rows.map((row) => (
                <View
                  key={row.dayOfWeek}
                  className="gap-3 rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[15px] text-[#26242A]">
                      {DAY_LABELS[row.dayOfWeek]}
                    </Text>
                    <Switch
                      value={row.enabled}
                      onValueChange={(value) => toggleDay(row.dayOfWeek, value)}
                      trackColor={{ false: '#DCD6C8', true: '#4B2E46' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                  {row.enabled ? (
                    <View className="flex-row items-center gap-3">
                      <View className="flex-1" style={{ minWidth: 0 }}>
                        <DateTimeField
                          mode="time"
                          placeholder="09:00"
                          value={row.startTime}
                          onChangeValue={(value) =>
                            updateDayTime(row.dayOfWeek, 'startTime', value)
                          }
                        />
                      </View>
                      <Text className="text-[13px] text-[#817F80]">to</Text>
                      <View className="flex-1" style={{ minWidth: 0 }}>
                        <DateTimeField
                          mode="time"
                          placeholder="17:00"
                          value={row.endTime}
                          onChangeValue={(value) =>
                            updateDayTime(row.dayOfWeek, 'endTime', value)
                          }
                        />
                      </View>
                    </View>
                  ) : null}
                </View>
              ))}
            </View>

            {(scheduleError ?? scheduleServerError) ? (
              <Text className="mt-3 text-[13px] text-[#E5484D]">
                {scheduleError ?? scheduleServerError}
              </Text>
            ) : null}

            <View className="mt-4">
              <Button
                label={
                  setScheduleMutation.isPending ? 'Saving…' : 'Save schedule'
                }
                onPress={handleSaveSchedule}
                loading={setScheduleMutation.isPending}
              />
            </View>

            <Text className="mt-7 font-serif-bold text-[18px] text-[#26242A]">
              Days off
            </Text>

            {daysOff?.length ? (
              <View className="mt-3 gap-2">
                {daysOff.map((dayOff) => (
                  <View
                    key={dayOff.id}
                    className="flex-row items-center justify-between rounded-[20px] border border-[#ECE7E0] bg-white p-4"
                  >
                    <View className="gap-0.5">
                      <Text className="text-[15px] text-[#26242A]">
                        {dayOff.date}
                      </Text>
                      {dayOff.reason ? (
                        <Text className="text-[13px] text-[#817F80]">
                          {dayOff.reason}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable onPress={() => removeDayOffMutation.mutate(dayOff.id)}>
                      <Text className="text-[13px] font-bold text-[#E5484D]">
                        Remove
                      </Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text className="mt-3 text-[13px] text-[#817F80]">
                No upcoming days off.
              </Text>
            )}

            <View className="mt-3">
              <DateTimeField
                mode="date"
                placeholder="Date"
                value={dayOffDate}
                onChangeValue={setDayOffDate}
              />
            </View>
            <TextInput
              placeholder="Reason (optional)"
              placeholderTextColor="#A8A39B"
              value={dayOffReason}
              onChangeText={setDayOffReason}
              className="mt-3 rounded-[16px] border border-[#ECE7E0] bg-white px-4 py-3.5 text-[15px] text-[#26242A]"
              style={{ outlineWidth: 0 }}
            />

            {(dayOffError ?? dayOffServerError) ? (
              <Text className="mt-3 text-[13px] text-[#E5484D]">
                {dayOffError ?? dayOffServerError}
              </Text>
            ) : null}

            <View className="mt-4">
              <Button
                label={addDayOffMutation.isPending ? 'Adding…' : 'Add day off'}
                onPress={handleAddDayOff}
                loading={addDayOffMutation.isPending}
              />
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
