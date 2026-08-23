/**
 * Tool handlers. Each one makes GET calls through the read-only client, shapes
 * the response for a context window (contract §5), and returns text.
 *
 * No handler ever returns binary content, and none can: the only artifact-
 * facing call asks the API for a signed URL and prints it (contract §2.4).
 */

import type { ReadOnlyHttpClient } from '../upstream/client.js';
import { fitItems, fits, renderSections, utf8Bytes } from '../shaping/budget.js';
import { MAX_RESULT_BYTES } from '../constants.js';
import {
  shapeDownloadUrl,
  shapeJob,
  shapeJobSummary,
  shapeSchemaSummary,
  shapeTemplate,
  shapeTemplateSummary,
  type RawArtifact,
  type RawDownloadUrl,
  type RawJob,
  type RawJobError,
  type RawJobSummary,
  type RawSchemaSummary,
  type RawTemplate,
  type RawTemplateSummary
} from '../shaping/shape.js';
import { clampLimit } from './schemas.js';
import { toolError, toolOk, type ToolResult } from './results.js';

interface Page<T> {
  items: T[];
  nextCursor?: string | null;
}

/**
 * Contract §5, pagination honesty: when there is more to fetch, say so in words
 * and hand over the cursor, so the model continues instead of assuming it has
 * seen everything.
 */
function cursorNote(nextCursor: string | null | undefined, toolName: string): string {
  if (!nextCursor) return 'This is the last page — there are no further results.';
  return `More results exist. Call ${toolName} again with cursor="${nextCursor}" to continue; do not treat this page as complete.`;
}

function truncationNote(omitted: number, noun: string): string {
  if (omitted === 0) return '';
  return `${omitted} further ${noun} were omitted from this result to stay within the tool result size limit. Narrow the filters or lower "limit" to see them.`;
}

export async function listTemplates(
  client: ReadOnlyHttpClient,
  args: { target?: string; limit?: number; cursor?: string }
): Promise<ToolResult> {
  const limit = clampLimit(args.limit);

  // `listSchemas` is folded in here rather than exposed as its own tool
  // (contract §4): knowing which payload schema a target uses is only ever
  // useful alongside the templates that render it.
  const [templatesResponse, schemasResponse] = await Promise.all([
    client.get<Page<RawTemplateSummary>>('/templates', {
      params: { target: args.target, limit, cursor: args.cursor }
    }),
    client.get<{ items: RawSchemaSummary[] }>('/schemas', {
      params: { target: args.target }
    })
  ]);

  const templates = templatesResponse.data.items ?? [];
  const schemas = (schemasResponse.data.items ?? []).map(shapeSchemaSummary);

  const { text } = fitItems(templates, (shown, omitted) =>
    renderSections(
      [
        `${shown.length} template${shown.length === 1 ? '' : 's'}${args.target ? ` for target "${args.target}"` : ''}.`,
        truncationNote(omitted, 'templates'),
        cursorNote(templatesResponse.data.nextCursor, 'list_templates'),
        'Call get_template for the layouts, style names and slot limits of one template.'
      ],
      {
        templates: shown.map(shapeTemplateSummary),
        payloadSchemas: schemas
      }
    )
  );

  return toolOk(text);
}

export async function getTemplate(
  client: ReadOnlyHttpClient,
  args: { templateId: string }
): Promise<ToolResult> {
  const { data } = await client.get<RawTemplate>(
    `/templates/${encodeURIComponent(args.templateId)}`
  );

  const render = (layouts: RawTemplate['layouts'], omitted: number): string =>
    renderSections(
      [
        `Template "${data.id}" renders ${data.target} payloads${data.schemaId ? ` against schema ${data.schemaId}` : ''}.`,
        truncationNote(omitted, 'layouts'),
        data.layouts?.length
          ? 'The "layouts" entries are the only valid values for a payload\'s layout field, and their slots are the only valid slot names.'
          : '',
        data.styles?.length
          ? 'The "styles" entries are the only valid values for a payload\'s style field.'
          : ''
      ],
      shapeTemplate({ ...data, layouts })
    );

  // A record is never truncated mid-structure; its layout list is the one part
  // that can be shortened without producing something misleading.
  const fitted = fitItems(data.layouts ?? [], (shown, omitted) => render(shown, omitted));
  return toolOk(fitted.text);
}

export async function getPayloadSchema(
  client: ReadOnlyHttpClient,
  args: { schemaId: string }
): Promise<ToolResult> {
  const { data } = await client.get<Record<string, unknown>>(
    `/schemas/${args.schemaId.split('/').map(encodeURIComponent).join('/')}`,
    { accept: 'application/schema+json' }
  );

  const text = renderSections(
    [
      `JSON Schema ${args.schemaId}. Use it verbatim as a structured-output constraint when generating a document payload.`,
      'Layout and style values are not enumerated here — get_template lists the ones a given template accepts.'
    ],
    data
  );

  if (fits(text)) return toolOk(text);

  // Truncating a schema would produce an invalid schema, which is worse than
  // not returning one. Say what happened and how to narrow it instead.
  const topLevel = Object.keys(data).join(', ');
  return toolError(
    [
      `Schema ${args.schemaId} is ${Math.round(utf8Bytes(text) / 1024)} KB, above the ${Math.round(MAX_RESULT_BYTES / 1024)} KB tool result limit, and a partial JSON Schema would be invalid rather than merely incomplete.`,
      `Its top-level keys are: ${topLevel}.`,
      'Fetch it directly from GET /schemas/{schemaId} on the document API if the full document is required.'
    ].join('\n')
  );
}

export async function listRenderJobs(
  client: ReadOnlyHttpClient,
  args: {
    status?: string;
    target?: string;
    createdAfter?: string;
    createdBefore?: string;
    limit?: number;
    cursor?: string;
  }
): Promise<ToolResult> {
  const limit = clampLimit(args.limit);

  const { data } = await client.get<Page<RawJobSummary>>('/jobs', {
    params: {
      status: args.status,
      target: args.target,
      createdAfter: args.createdAfter,
      createdBefore: args.createdBefore,
      limit,
      cursor: args.cursor
    }
  });

  const jobs = data.items ?? [];
  const filters = [
    args.status ? `status=${args.status}` : '',
    args.target ? `target=${args.target}` : '',
    args.createdAfter ? `createdAfter=${args.createdAfter}` : '',
    args.createdBefore ? `createdBefore=${args.createdBefore}` : ''
  ].filter(Boolean);

  const { text } = fitItems(jobs, (shown, omitted) =>
    renderSections(
      [
        `${shown.length} render job${shown.length === 1 ? '' : 's'}, most recent first${filters.length ? ` (${filters.join(', ')})` : ''}.`,
        truncationNote(omitted, 'jobs'),
        cursorNote(data.nextCursor, 'list_render_jobs'),
        'Call get_render_job for one job\'s errors and produced files.'
      ],
      { jobs: shown.map(shapeJobSummary) }
    )
  );

  return toolOk(text);
}

export async function getRenderJob(
  client: ReadOnlyHttpClient,
  args: { jobId: string }
): Promise<ToolResult> {
  // Contract §5: `include=payload` is never sent. The submitted payload is not
  // returned to the model, so it is not requested in the first place.
  const { data } = await client.get<RawJob>(`/jobs/${encodeURIComponent(args.jobId)}`);

  let artifacts: RawArtifact[] = data.artifacts ?? [];
  if (artifacts.length === 0 && data.status === 'succeeded') {
    // `listJobArtifacts` is folded in here rather than exposed as its own tool
    // (contract §4), for jobs whose record does not embed the list.
    const { data: artifactPage } = await client.get<{ items: RawArtifact[] }>(
      `/jobs/${encodeURIComponent(args.jobId)}/artifacts`
    );
    artifacts = artifactPage.items ?? [];
  }

  const errors: RawJobError[] = data.errors ?? [];

  const render = (shownErrors: RawJobError[], shownArtifacts: RawArtifact[]): string =>
    renderSections(
      [
        `Job ${data.id} is ${data.status}${data.durationMs != null ? `, took ${data.durationMs} ms` : ''}.`,
        errors.length > shownErrors.length
          ? truncationNote(errors.length - shownErrors.length, 'errors')
          : '',
        artifacts.length > shownArtifacts.length
          ? truncationNote(artifacts.length - shownArtifacts.length, 'artifacts')
          : '',
        shownErrors.length
          ? 'Each error\'s "pointer" is a JSON Pointer into the submitted payload — the exact location to correct.'
          : '',
        shownArtifacts.length
          ? 'Call get_artifact_link with an artifact id for a short-lived download URL. File bytes are never returned by these tools.'
          : '',
        'The submitted payload is not available through these tools.'
      ],
      shapeJob(data, { artifacts: shownArtifacts, errors: shownErrors })
    );

  // Both nested lists can be shortened; drop from the longer one first so a job
  // with one error and forty artifacts keeps its error, and vice versa.
  const shownErrors = [...errors];
  const shownArtifacts = [...artifacts];
  while (!fits(render(shownErrors, shownArtifacts))) {
    if (shownErrors.length <= 1 && shownArtifacts.length <= 1) break;
    if (shownArtifacts.length >= shownErrors.length) shownArtifacts.pop();
    else shownErrors.pop();
  }

  return toolOk(render(shownErrors, shownArtifacts));
}

export async function getArtifactLink(
  client: ReadOnlyHttpClient,
  args: { artifactId: string }
): Promise<ToolResult> {
  const { data } = await client.get<RawDownloadUrl>(
    `/artifacts/${encodeURIComponent(args.artifactId)}/download-url`
  );

  return toolOk(
    renderSections(
      [
        `Signed download URL for artifact ${args.artifactId}, valid until ${data.expiresAt}.`,
        'Give this URL to the user rather than attempting to fetch it — these tools never return file bytes.'
      ],
      shapeDownloadUrl(data)
    )
  );
}
