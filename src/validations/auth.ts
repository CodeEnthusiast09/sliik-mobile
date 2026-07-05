import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['customer', 'provider']),
    fullName: z.string().min(1, 'Enter your full name'),
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
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
