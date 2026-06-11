import { z } from 'zod';
import { AdaptationResultSchema } from './adapt.contract';

/**
 * Schema for validating the stored adaptation result before export.
 * Reuses the AdaptationResultSchema from the adapt contract.
 */
export const ExportAdaptationResultSchema = AdaptationResultSchema;

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
