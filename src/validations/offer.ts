import { z } from 'zod';

export const createOfferSchema = z
  .object({
    serviceType: z
      .string()
      .min(1, 'Enter the type of service you need')
      .max(100, 'Keep it under 100 characters'),
    description: z.string().min(1, 'Describe what you need'),
    budget: z.number().positive('Enter a valid budget').optional(),
    preferredFrom: z.iso.datetime('Enter a valid start date and time'),
    preferredTo: z.iso.datetime('Enter a valid end date and time'),
    city: z.string().min(1, 'Enter your city').max(100, 'Keep it under 100 characters'),
    referenceImageUrl: z.url('Enter a valid image URL').optional(),
  })
  .refine((data) => new Date(data.preferredTo) > new Date(data.preferredFrom), {
    message: 'End time must be after start time',
    path: ['preferredTo'],
  });

export type CreateOfferInput = z.infer<typeof createOfferSchema>;

export const respondToOfferSchema = z.object({
  offeredPrice: z.number().positive('Enter your price'),
  message: z.string().min(1, 'Message cannot be empty').optional(),
});

export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;
