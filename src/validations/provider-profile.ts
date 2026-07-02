import { z } from 'zod';

export const updateProviderProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  tradeType: z.string().min(1).optional(),
  yearsExperience: z.number().min(0).max(60).optional(),
  city: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
