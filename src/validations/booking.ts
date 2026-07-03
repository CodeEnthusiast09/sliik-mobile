import { z } from 'zod';

export const createBookingSchema = z.object({
  providerId: z.uuid(),
  serviceId: z.uuid(),
  scheduledAt: z.iso.datetime(),
  notes: z.string().min(1).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
