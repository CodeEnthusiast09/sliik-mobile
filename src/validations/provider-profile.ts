import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  tradeType: z.string().min(1).optional(),
  // coerce from the text input's string; empty means "not set".
  yearsExperience: z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number().min(0).max(60).optional(),
  ),
  city: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
