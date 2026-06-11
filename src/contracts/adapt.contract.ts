import { z } from 'zod';

export const AdaptRequestSchema = z.object({
  job_description: z.string().min(50).max(20000),
  model: z.string().optional(),
});

const ExperienceItemSchema = z.object({
  company: z.string(),
  role: z.string(),
  period: z.string(),
  bullets: z.array(z.string()),
});

const EducationItemSchema = z.object({
  institution: z.string(),
  degree: z.string(),
  year: z.string(),
});

export const AdaptedResumeSchema = z.object({
  summary: z.string(),
  technical_skills: z.array(z.string()),
  experience: z.array(ExperienceItemSchema),
  education: z.array(EducationItemSchema),
  certifications: z.array(z.string()),
});

export const StrengthSchema = z.object({
  area: z.string(),
  evidence: z.string(),
  talking_point: z.string(),
});

export const GapSchema = z.object({
  skill: z.string(),
  severity: z.enum(['critical', 'nice-to-have']),
  mitigation: z.string(),
});

export const TransferableSkillSchema = z.object({
  skill: z.string(),
  source_experience: z.string(),
  relevance_to_role: z.string(),
  bridge_statement: z.string(),
});

export const AdaptationResultSchema = z.object({
  adapted_resume: AdaptedResumeSchema,
  strengths: z.array(StrengthSchema),
  gaps: z.array(GapSchema),
  transferable_skills: z.array(TransferableSkillSchema),
});

export const AdaptResponseSchema = z.object({
  success: z.literal(true),
  data: AdaptationResultSchema,
  metadata: z.object({
    model_used: z.string(),
    tokens_used: z.number(),
    processing_time_ms: z.number(),
    portkey_request_id: z.string(),
  }),
});

export type AdaptRequest = z.infer<typeof AdaptRequestSchema>;
export type AdaptedResume = z.infer<typeof AdaptedResumeSchema>;
export type Strength = z.infer<typeof StrengthSchema>;
export type Gap = z.infer<typeof GapSchema>;
export type TransferableSkill = z.infer<typeof TransferableSkillSchema>;
export type AdaptationResult = z.infer<typeof AdaptationResultSchema>;
export type AdaptResponse = z.infer<typeof AdaptResponseSchema>;
