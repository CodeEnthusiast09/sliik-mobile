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

// API payload for POST /auth/reset-password.
export const resetPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Form-only schema: adds the confirm field and the match check (not sent to the API).
export const resetPasswordFormSchema = resetPasswordSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

// API payload for POST /auth/verify-email.
export const verifyEmailSchema = z.object({
  email: z.email('Enter a valid email address'),
  code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// API payload for POST /auth/resend-verification.
export const resendVerificationSchema = z.object({
  email: z.email('Enter a valid email address'),
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

// API payload for POST /auth/google. idToken comes from the Google OAuth flow.
export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
  role: z.enum(['customer', 'provider']),
});

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
