import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.email(),
    password: z.string().min(8),
    role: z.enum(['customer', 'provider']),
    fullName: z.string().min(1),
    tradeType: z.string().min(1).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'provider' && !data.tradeType) {
      ctx.addIssue({
        code: 'custom',
        path: ['tradeType'],
        message: 'Trade type is required for providers',
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
