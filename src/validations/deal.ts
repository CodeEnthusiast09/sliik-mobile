import { z } from 'zod';

export const createDealSchema = z
  .object({
    serviceId: z.uuid('Pick a service'),
    title: z.string().min(1, 'Enter a deal title').max(50, 'Title is too long'),
    description: z
      .string()
      .min(1, 'Description cannot be empty')
      .max(120, 'Description is too long')
      .optional(),
    originalPrice: z.number().positive('Enter the original price'),
    dealPrice: z.number().positive('Enter the deal price'),
    slotsTotal: z.number().int().min(1, 'Enter at least 1 slot'),
    expiresAt: z.iso.datetime('Enter a valid expiry date and time'),
    startsAt: z.iso.datetime('Enter a valid start date and time').optional(),
  })
  .refine((data) => data.dealPrice < data.originalPrice, {
    message: 'Deal price must be lower than original price',
    path: ['dealPrice'],
  })
  .refine(
    (data) => !data.startsAt || new Date(data.startsAt) < new Date(data.expiresAt),
    {
      message: 'Start date must be before the expiry date',
      path: ['startsAt'],
    },
  );

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const claimDealSchema = z.object({
  scheduledAt: z.iso.datetime('Pick a time slot'),
});

export type ClaimDealInput = z.infer<typeof claimDealSchema>;
