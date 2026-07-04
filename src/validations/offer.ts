import { z } from 'zod';

export const createOfferSchema = z
  .object({
    serviceType: z.string().min(1).max(100),
    description: z.string().min(1),
    budget: z.number().positive().optional(),
    preferredFrom: z.iso.datetime(),
    preferredTo: z.iso.datetime(),
    city: z.string().min(1).max(100),
  })
  .refine((data) => new Date(data.preferredTo) > new Date(data.preferredFrom), {
    message: 'End time must be after start time',
    path: ['preferredTo'],
  });

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const respondToOfferSchema = z.object({
  offeredPrice: z.number().positive(),
  message: z.string().min(1).optional(),
});

export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;
