/**
 * Argument schemas — contract §4.3.
 *
 * Every constraint here is derived from the corresponding OpenAPI parameter, so
 * a malformed identifier is rejected before any HTTP call is made.
 */

import { z } from 'zod';

/** openapi.yaml → components.schemas.Target */
export const targetSchema = z.enum(['pptx', 'docx', 'html']);

/** openapi.yaml → components.schemas.JobStatus */
export const jobStatusSchema = z.enum(['queued', 'running', 'succeeded', 'failed', 'expired']);

/**
 * Values above 100 are clamped rather than rejected (contract §4.3), so the
 * upper bound lives in `clampLimit`, not in the schema.
 */
export const limitSchema = z
  .number()
  .int()
  .min(1)
  .describe('Maximum items to return. Defaults to 20; values above 100 are clamped to 100.');

export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  return Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
}

/** Opaque; passed through untouched (contract §4.3). */
export const cursorSchema = z
  .string()
  .max(512)
  .describe('Opaque pagination cursor taken verbatim from a previous result.');

/** openapi.yaml → components.parameters.TemplateId */
export const templateIdSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]{0,62}$/, 'Template identifiers are lowercase letters, digits and hyphens');

/** openapi.yaml → components.parameters.SchemaId */
export const schemaIdSchema = z
  .string()
  .regex(/^(pptx|docx|html)\/v[0-9]+$/, 'Schema identifiers look like "pptx/v1"');

/** openapi.yaml → components.parameters.JobId / ArtifactId */
export const uuidSchema = z.string().uuid('Expected a UUID');

export const dateTimeSchema = z.string().datetime({ offset: true });

export const listTemplatesInput = {
  target: targetSchema.optional(),
  limit: limitSchema.optional(),
  cursor: cursorSchema.optional()
};

export const getTemplateInput = {
  templateId: templateIdSchema
};

export const getPayloadSchemaInput = {
  schemaId: schemaIdSchema
};

export const listRenderJobsInput = {
  status: jobStatusSchema.optional(),
  target: targetSchema.optional(),
  createdAfter: dateTimeSchema.optional(),
  createdBefore: dateTimeSchema.optional(),
  limit: limitSchema.optional(),
  cursor: cursorSchema.optional()
};

export const getRenderJobInput = {
  jobId: uuidSchema
};

export const getArtifactLinkInput = {
  artifactId: uuidSchema
};
