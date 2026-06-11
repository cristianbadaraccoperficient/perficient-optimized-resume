import { z } from 'zod';

export const ExplanationPostRequestSchema = z.object({
  content: z.string().min(1).max(50000),
});

export const ExplanationPostResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    length: z.number(),
    formatted: z.boolean(),
    format_error: z.string().optional(),
  }),
});

export const ExplanationGetResponseSchema = z.object({
  exists: z.literal(true),
  content: z.string(),
  formatted_md: z.string().nullable(),
  updated_at: z.string(),
});

export const ExplanationNotFoundResponseSchema = z.object({
  exists: z.literal(false),
});

export type ExplanationPostRequest = z.infer<typeof ExplanationPostRequestSchema>;
export type ExplanationPostResponse = z.infer<typeof ExplanationPostResponseSchema>;
export type ExplanationGetResponse = z.infer<typeof ExplanationGetResponseSchema>;
export type ExplanationNotFoundResponse = z.infer<typeof ExplanationNotFoundResponseSchema>;
