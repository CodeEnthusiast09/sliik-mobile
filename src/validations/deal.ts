import { z } from 'zod';

export const createDealSchema = z
  .object({
    serviceId: z.uuid('Pick a service'),
    title: z.string().min(1, 'Enter a deal title').max(255, 'Title is too long'),
    description: z.string().min(1, 'Description cannot be empty').optional(),
    originalPrice: z.number().positive('Enter the original price'),
    dealPrice: z.number().positive('Enter the deal price'),
    slotsTotal: z.number().int().min(1, 'Enter at least 1 slot'),
    expiresAt: z.iso.datetime('Enter a valid expiry date and time'),
  })
  .refine((data) => data.dealPrice < data.originalPrice, {
    message: 'Deal price must be lower than original price',
    path: ['dealPrice'],
  });

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const claimDealSchema = z.object({
  scheduledAt: z.iso.datetime('Pick a time slot'),
});

export type ClaimDealInput = z.infer<typeof claimDealSchema>;
