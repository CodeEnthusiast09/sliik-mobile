import type { ApiResponse } from '@/interfaces/api-response';
import type { AvailabilitySlot, DayOff } from '@/interfaces/provider';
import type { AddDayOffInput, SetScheduleInput } from '@/validations/availability';

import { apiClient } from './api-client';

export async function getSchedule() {
  const { data } = await apiClient.get<ApiResponse<AvailabilitySlot[]>>(
    '/availability/schedule',
  );
  return data;
}

export async function setSchedule(payload: SetScheduleInput) {
  const { data } = await apiClient.put<ApiResponse<AvailabilitySlot[]>>(
    '/availability/schedule',
    payload,
  );
  return data;
}

export async function getDaysOff() {
  const { data } = await apiClient.get<ApiResponse<DayOff[]>>('/availability/days-off');
  return data;
}

export async function addDayOff(payload: AddDayOffInput) {
  const { data } = await apiClient.post<ApiResponse<DayOff>>('/availability/days-off', payload);
  return data;
}

export async function removeDayOff(id: string) {
  const { data } = await apiClient.delete<ApiResponse<undefined>>(
    `/availability/days-off/${id}`,
  );
  return data;
}
