import { z } from 'zod';

export const updateCustomerProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>;
