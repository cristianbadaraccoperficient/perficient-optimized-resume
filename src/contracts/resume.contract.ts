import { z } from 'zod';

const ResumeStructuredSchema = z.object({
  summary: z.string().optional(),
  experience: z.array(z.any()),
  skills: z.array(z.any()),
  education: z.array(z.any()),
});

export const ResumeUploadResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.object({
    filename: z.string(),
    parsed_length: z.number(),
    sections_detected: z.array(z.string()),
  }),
});

export const ResumeGetResponseSchema = z.object({
  exists: z.literal(true),
  raw_text: z.string(),
  structured: ResumeStructuredSchema,
  uploaded_at: z.string(),
  original_filename: z.string(),
});

export const ResumeNotFoundResponseSchema = z.object({
  exists: z.literal(false),
});

export type ResumeUploadResponse = z.infer<typeof ResumeUploadResponseSchema>;
export type ResumeGetResponse = z.infer<typeof ResumeGetResponseSchema>;
export type ResumeNotFoundResponse = z.infer<typeof ResumeNotFoundResponseSchema>;
export type ResumeStructured = z.infer<typeof ResumeStructuredSchema>;
