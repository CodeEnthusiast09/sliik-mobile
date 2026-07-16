import { z } from 'zod';

export const createPayoutAccountSchema = z.object({
  bankCode: z.string().min(1),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
});

export type CreatePayoutAccountInput = z.infer<typeof createPayoutAccountSchema>;
