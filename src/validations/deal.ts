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

// The datetime picker yields a local "YYYY-MM-DDTHH:MM" (clock-face, no
// timezone); the API wants a full ISO string, same convention as the rest of
// the app.
const toIsoDateTime = (localValue: string) => `${localValue}:00.000Z`;

// Form schema for the New Deal screen: number fields arrive as strings (text
// inputs) and dates in the picker's local format. This coerces/validates the
// raw form values and transforms the output into the createDeal API payload.
export const createDealFormSchema = z
  .object({
    serviceId: z.uuid('Pick a service'),
    title: z.string().min(1, 'Enter a deal title').max(50, 'Title is too long'),
    description: z.string().max(120, 'Description is too long').optional(),
    originalPrice: z.coerce.number().positive('Enter the original price'),
    dealPrice: z.coerce.number().positive('Enter the deal price'),
    slotsTotal: z.coerce.number().int().min(1, 'Enter at least 1 slot'),
    expiresAt: z.string().min(1, 'Enter a valid expiry date and time'),
    startsAt: z.string().optional(),
  })
  .refine((data) => data.dealPrice < data.originalPrice, {
    message: 'Deal price must be lower than original price',
    path: ['dealPrice'],
  })
  .refine(
    (data) =>
      !data.startsAt ||
      new Date(toIsoDateTime(data.startsAt)) <
        new Date(toIsoDateTime(data.expiresAt)),
    {
      message: 'Start date must be before the expiry date',
      path: ['startsAt'],
    },
  )
  .transform((data) => ({
    serviceId: data.serviceId,
    title: data.title,
    description: data.description || undefined,
    originalPrice: data.originalPrice,
    dealPrice: data.dealPrice,
    slotsTotal: data.slotsTotal,
    expiresAt: toIsoDateTime(data.expiresAt),
    startsAt: data.startsAt ? toIsoDateTime(data.startsAt) : undefined,
  }));

export type CreateDealFormInput = z.input<typeof createDealFormSchema>;

export const claimDealSchema = z.object({
  scheduledAt: z.iso.datetime('Pick a time slot'),
});

export type ClaimDealInput = z.infer<typeof claimDealSchema>;
