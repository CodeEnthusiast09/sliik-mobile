import { z } from 'zod';

export const createDealSchema = z
  .object({
    serviceId: z.uuid(),
    title: z.string().min(1).max(255),
    description: z.string().min(1).optional(),
    originalPrice: z.number().positive(),
    dealPrice: z.number().positive(),
    slotsTotal: z.number().int().min(1),
    expiresAt: z.iso.datetime(),
  })
  .refine((data) => data.dealPrice < data.originalPrice, {
    message: 'Deal price must be lower than original price',
    path: ['dealPrice'],
  });

export type CreateDealInput = z.infer<typeof createDealSchema>;

export const claimDealSchema = z.object({
  scheduledAt: z.iso.datetime(),
});

export type ClaimDealInput = z.infer<typeof claimDealSchema>;
