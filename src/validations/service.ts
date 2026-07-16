import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z
    .number()
    .positive()
    .refine((value) => Math.round(value * 100) / 100 === value, {
      message: 'Price must have at most 2 decimal places',
    }),
  durationMinutes: z.number().min(1),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  addOns: z.array(z.string()).optional(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
