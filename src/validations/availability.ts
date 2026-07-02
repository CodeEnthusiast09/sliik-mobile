import { z } from 'zod';

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleSlotSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(timePattern, 'Use 24h HH:MM format'),
    endTime: z.string().regex(timePattern, 'Use 24h HH:MM format'),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type ScheduleSlotInput = z.infer<typeof scheduleSlotSchema>;

export const setScheduleSchema = z.object({
  slots: z.array(scheduleSlotSchema).min(1),
});

export type SetScheduleInput = z.infer<typeof setScheduleSchema>;

export const addDayOffSchema = z.object({
  date: z.iso.date(),
  reason: z.string().max(255).optional(),
});

export type AddDayOffInput = z.infer<typeof addDayOffSchema>;
