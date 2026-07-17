import { z } from 'zod';

export const createOfferSchema = z
  .object({
    serviceType: z
      .string()
      .min(1, 'Enter the type of service you need')
      .max(100, 'Keep it under 100 characters'),
    description: z
      .string()
      .min(1, 'Describe what you need')
      .max(300, 'Keep it under 300 characters'),
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

const PREFERRED_WINDOW_MS = 60 * 60 * 1000;

// Form schema for the Post Offer screen. One datetime picker drives both
// preferredFrom and a preferredTo one hour later; budget arrives as a string
// (empty means "no budget"). Output matches the createOffer API payload.
export const createOfferFormSchema = z
  .object({
    serviceType: z
      .string()
      .min(1, 'Enter the type of service you need')
      .max(100, 'Keep it under 100 characters'),
    description: z
      .string()
      .min(1, 'Describe what you need')
      .max(300, 'Keep it under 300 characters'),
    budget: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.coerce.number().positive('Enter a valid budget').optional(),
    ),
    preferredDateTime: z.string().min(1, 'Enter a valid start date and time'),
    city: z
      .string()
      .min(1, 'Enter your city')
      .max(100, 'Keep it under 100 characters'),
    referenceImageUrl: z.string().optional(),
  })
  .transform((data) => {
    // Matches the original screen: the local clock-face value is read in the
    // device timezone, then serialized to UTC (not the append-Z convention).
    const from = new Date(`${data.preferredDateTime}:00`);
    return {
      serviceType: data.serviceType,
      description: data.description,
      budget: data.budget,
      preferredFrom: from.toISOString(),
      preferredTo: new Date(from.getTime() + PREFERRED_WINDOW_MS).toISOString(),
      city: data.city,
      referenceImageUrl: data.referenceImageUrl || undefined,
    };
  });

export type CreateOfferFormInput = z.input<typeof createOfferFormSchema>;

export const respondToOfferSchema = z.object({
  offeredPrice: z.number().positive('Enter your price'),
  message: z.string().min(1, 'Message cannot be empty').optional(),
});

export type RespondToOfferInput = z.infer<typeof respondToOfferSchema>;
