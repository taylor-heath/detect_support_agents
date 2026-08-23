/**
 * Response shaping — contract §5.
 *
 * The API's representations are sized for programmatic clients; tool results
 * are sized for a context window. Every field that reaches the model passes
 * through one of these functions.
 *
 * Deliberately dropped:
 *   - `checksumSha256` — no tool's purpose is integrity verification, and the
 *     model can do nothing with 64 hex characters.
 *   - `submittedBy` — a principal identifier is caller metadata, not document
 *     information.
 *   - `artifact.jobId` — redundant, the job is already the surrounding context.
 *   - `payload` — never requested, never returned (see tools/getRenderJob.ts).
 */

export interface RawTemplateSummary {
  id: string;
  name: string;
  target: string;
  description?: string;
  updatedAt?: string;
}

export interface RawTemplate extends RawTemplateSummary {
  schemaId?: string;
  layouts?: Array<{
    id: string;
    slots: string[];
    maxBullets?: number;
    maxTitleLength?: number;
  }>;
  styles?: string[];
}

export interface RawSchemaSummary {
  id: string;
  target: string;
  version: number;
  deprecated?: boolean;
}

export interface RawArtifact {
  id: string;
  jobId?: string;
  filename: string;
  mediaType: string;
  sizeBytes: number;
  checksumSha256?: string;
  createdAt?: string;
  expiresAt?: string | null;
}

export interface RawJobSummary {
  id: string;
  status: string;
  target: string;
  templateId?: string;
  title?: string;
  createdAt: string;
  completedAt?: string | null;
}

export interface RawJobError {
  code: string;
  message: string;
  pointer?: string;
}

export interface RawJob extends RawJobSummary {
  schemaId?: string;
  submittedBy?: string;
  durationMs?: number | null;
  artifacts?: RawArtifact[];
  errors?: RawJobError[];
  payload?: unknown;
}

export interface RawDownloadUrl {
  url: string;
  expiresAt: string;
  mediaType?: string;
  sizeBytes?: number;
}

/** Drops undefined and null members so the JSON a model reads stays dense. */
function compact<T extends Record<string, unknown>>(value: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, member] of Object.entries(value)) {
    if (member === undefined || member === null) continue;
    if (Array.isArray(member) && member.length === 0) continue;
    out[key] = member;
  }
  return out as Partial<T>;
}

export function shapeTemplateSummary(raw: RawTemplateSummary): Record<string, unknown> {
  return compact({
    id: raw.id,
    name: raw.name,
    target: raw.target,
    description: raw.description,
    updatedAt: raw.updatedAt
  });
}

export function shapeTemplate(raw: RawTemplate): Record<string, unknown> {
  return compact({
    id: raw.id,
    name: raw.name,
    target: raw.target,
    description: raw.description,
    schemaId: raw.schemaId,
    updatedAt: raw.updatedAt,
    layouts: raw.layouts?.map(layout =>
      compact({
        id: layout.id,
        slots: layout.slots,
        maxBullets: layout.maxBullets,
        maxTitleLength: layout.maxTitleLength
      })
    ),
    styles: raw.styles
  });
}

export function shapeSchemaSummary(raw: RawSchemaSummary): Record<string, unknown> {
  return compact({
    id: raw.id,
    target: raw.target,
    version: raw.version,
    deprecated: raw.deprecated === true ? true : undefined
  });
}

export function shapeJobSummary(raw: RawJobSummary): Record<string, unknown> {
  return compact({
    id: raw.id,
    status: raw.status,
    target: raw.target,
    templateId: raw.templateId,
    title: raw.title,
    createdAt: raw.createdAt,
    completedAt: raw.completedAt
  });
}

/**
 * Artifact metadata as it appears inside a job. `id` survives trimming because
 * it is the argument `get_artifact_link` needs — dropping it would strand the
 * model one step short of the file.
 */
export function shapeArtifact(raw: RawArtifact): Record<string, unknown> {
  return compact({
    id: raw.id,
    filename: raw.filename,
    mediaType: raw.mediaType,
    sizeBytes: raw.sizeBytes,
    createdAt: raw.createdAt,
    expiresAt: raw.expiresAt
  });
}

/** `pointer` is preserved verbatim — contract §5, the error-detail rule. */
export function shapeJobError(raw: RawJobError): Record<string, unknown> {
  return compact({
    code: raw.code,
    message: raw.message,
    pointer: raw.pointer
  });
}

export function shapeJob(
  raw: RawJob,
  lists: { artifacts: RawArtifact[]; errors: RawJobError[] }
): Record<string, unknown> {
  return compact({
    id: raw.id,
    status: raw.status,
    target: raw.target,
    templateId: raw.templateId,
    schemaId: raw.schemaId,
    title: raw.title,
    createdAt: raw.createdAt,
    completedAt: raw.completedAt,
    durationMs: raw.durationMs,
    artifacts: lists.artifacts.map(shapeArtifact),
    errors: lists.errors.map(shapeJobError)
  });
}

export function shapeDownloadUrl(raw: RawDownloadUrl): Record<string, unknown> {
  return compact({
    url: raw.url,
    expiresAt: raw.expiresAt,
    mediaType: raw.mediaType,
    sizeBytes: raw.sizeBytes
  });
}
