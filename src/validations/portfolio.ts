import { z } from 'zod';

export const portfolioItemSchema = z.object({
  caption: z.string().optional(),
});

export type PortfolioItemInput = z.infer<typeof portfolioItemSchema>;
