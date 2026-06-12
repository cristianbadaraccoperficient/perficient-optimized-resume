import { z } from 'zod';
import { ResumeResultSchema } from './adapt.contract';

export const ExportAdaptationResultSchema = ResumeResultSchema;

export type ExportAdaptationResult = z.infer<typeof ExportAdaptationResultSchema>;

/**
 * Error response types for the export endpoint.
 */
export interface ExportErrorResponse {
  success: false;
  error: {
    code: ExportErrorCode;
    message: string;
  };
}

export type ExportErrorCode =
  | 'ADAPTATION_NOT_FOUND'
  | 'TEMPLATE_NOT_FOUND'
  | 'TEMPLATE_ERROR';
