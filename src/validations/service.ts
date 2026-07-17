import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  // coerce: the form holds these as strings (text input / select value) so
  // decimals stay typeable; they only become numbers at validation/submit.
  price: z.coerce
    .number()
    .positive()
    .refine((value) => Math.round(value * 100) / 100 === value, {
      message: 'Price must have at most 2 decimal places',
    }),
  durationMinutes: z.coerce.number().min(1),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  addOns: z.array(z.string()).optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
