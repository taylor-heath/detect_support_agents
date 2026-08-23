/**
 * The tool surface — contract §4.
 *
 * READ-ONLY BY CONSTRUCTION. Tools are declared as data in `READ_ONLY_TOOLS`
 * and registered by the single loop in `registerReadOnlyTools`. That loop is
 * the only caller of `server.registerTool` in the server, and it applies
 * `READ_ONLY_ANNOTATIONS` unconditionally — a tool cannot be registered
 * without `readOnlyHint: true`, because no tool definition gets to supply its
 * own annotations.
 *
 * The registry is length-checked against `MAX_TOOLS` at startup: a seventh tool
 * throws before the server accepts a connection, per contract §4 ("adding a
 * seventh requires an amendment to this contract"). `scripts/check-readonly.mjs`
 * fails CI on the same condition, so it does not depend on anyone running it.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MAX_TOOLS, REQUIRED_SCOPE } from '../constants.js';
import type { Logger } from '../logging.js';
import type { ReadOnlyHttpClient } from '../upstream/client.js';
import { OutboundAuthError } from '../upstream/errors.js';
import { currentRequestContext, currentSubject } from './context.js';
import * as handlers from './handlers.js';
import { mapUpstreamFailure, type ResourceRef, type ToolResult } from './results.js';
import {
  getArtifactLinkInput,
  getPayloadSchemaInput,
  getRenderJobInput,
  getTemplateInput,
  listRenderJobsInput,
  listTemplatesInput
} from './schemas.js';

/**
 * Contract §4.1 — every tool declares exactly these annotations. Frozen, and
 * spread into each registration rather than taken from the definition, so a
 * definition has no way to weaken them.
 */
export const READ_ONLY_ANNOTATIONS = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
} as const);

interface ToolDefinition {
  name: string;
  title: string;
  /**
   * Contract §4.2 — states what the tool returns and when to prefer it over a
   * sibling. Never restates the argument schema.
   */
  description: string;
  inputSchema: Record<string, unknown>;
  /** Names the resource for 404/410 messages. */
  refFor: (args: Record<string, unknown>) => ResourceRef;
  run: (client: ReadOnlyHttpClient, args: Record<string, unknown>) => Promise<ToolResult>;
}

const TOOLS: ToolDefinition[] = [
  {
    name: 'list_templates',
    title: 'List rendering templates',
    description:
      'Returns the rendering templates the document service offers — id, name, target format and description — together with the payload schema ids available for that target. Start here when choosing how to render a document, then use get_template for the chosen template. Does not include layout or style detail.',
    inputSchema: listTemplatesInput,
    refFor: () => ({ kind: 'template', id: 'templates' }),
    run: (client, args) =>
      handlers.listTemplates(client, args as Parameters<typeof handlers.listTemplates>[1])
  },
  {
    name: 'get_template',
    title: 'Get one template in full',
    description:
      'Returns one template with the layout ids, slot names, slot limits and named styles a payload may reference, plus the payload schema it renders. Prefer this over list_templates once a template id is known: it is the only source of the valid layout and style values for a payload.',
    inputSchema: getTemplateInput,
    refFor: args => ({ kind: 'template', id: String(args.templateId) }),
    run: (client, args) =>
      handlers.getTemplate(client, args as Parameters<typeof handlers.getTemplate>[1])
  },
  {
    name: 'get_payload_schema',
    title: 'Get a payload JSON Schema',
    description:
      'Returns a payload JSON Schema (2020-12) document, suitable for use verbatim as a structured-output constraint when generating a document payload. Use it for the shape and required fields of a payload; use get_template for which layout and style values a particular template accepts.',
    inputSchema: getPayloadSchemaInput,
    refFor: args => ({ kind: 'payload schema', id: String(args.schemaId) }),
    run: (client, args) =>
      handlers.getPayloadSchema(client, args as Parameters<typeof handlers.getPayloadSchema>[1])
  },
  {
    name: 'list_render_jobs',
    title: 'List recent render jobs',
    description:
      'Returns render jobs newest first — id, status, target, template and title — filterable by status, target and creation window. Use it to find a job whose id is unknown, or to survey recent successes and failures. Per-job errors and produced files come from get_render_job.',
    inputSchema: listRenderJobsInput,
    refFor: () => ({ kind: 'render job', id: 'jobs' }),
    run: (client, args) =>
      handlers.listRenderJobs(client, args as Parameters<typeof handlers.listRenderJobs>[1])
  },
  {
    name: 'get_render_job',
    title: 'Get one render job',
    description:
      'Returns one job with its status, timings, validation and rendering errors each carrying a JSON Pointer into the submitted payload, and metadata for every file it produced. Prefer this over list_render_jobs when diagnosing why a render failed or locating its output. The submitted payload itself is never returned.',
    inputSchema: getRenderJobInput,
    refFor: args => ({ kind: 'render job', id: String(args.jobId) }),
    run: (client, args) =>
      handlers.getRenderJob(client, args as Parameters<typeof handlers.getRenderJob>[1])
  },
  {
    name: 'get_artifact_link',
    title: 'Get a download link for a produced file',
    description:
      'Returns a short-lived signed URL, with its expiry, media type and size, for one file produced by a render job. Use it after get_render_job has supplied an artifact id, and hand the URL onward — file bytes are never returned by any tool here.',
    inputSchema: getArtifactLinkInput,
    refFor: args => ({ kind: 'artifact', id: String(args.artifactId) }),
    run: (client, args) =>
      handlers.getArtifactLink(client, args as Parameters<typeof handlers.getArtifactLink>[1])
  }
];

export const READ_ONLY_TOOLS: readonly ToolDefinition[] = Object.freeze(TOOLS);

export interface CallScopedClient {
  client: ReadOnlyHttpClient;
  /** Last upstream status seen by this client, for the log line. */
  status: { last: number | null };
}

export interface RegisterDeps {
  /**
   * Builds a client for one call, so each call carries the caller's own token
   * and its own status slot — two concurrent calls must not log each other's
   * upstream status.
   */
  clientFor: () => Promise<CallScopedClient>;
  logger: Logger;
}

function challengeFor(error: OutboundAuthError): string {
  const code = error.status === 401 ? 'invalid_token' : 'insufficient_scope';
  return `Bearer error="${code}", scope="${REQUIRED_SCOPE}"`;
}

export function registerReadOnlyTools(server: McpServer, deps: RegisterDeps): void {
  if (READ_ONLY_TOOLS.length > MAX_TOOLS) {
    throw new Error(
      `Read-only contract violation: ${READ_ONLY_TOOLS.length} tools registered, ${MAX_TOOLS} permitted. Adding a tool requires an amendment to the build contract (§4).`
    );
  }

  for (const tool of READ_ONLY_TOOLS) {
    server.registerTool(
      tool.name,
      {
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema as never,
        annotations: { ...READ_ONLY_ANNOTATIONS }
      },
      (async (args: Record<string, unknown>): Promise<ToolResult> => {
        const startedAt = performance.now();
        let scoped: CallScopedClient | undefined;

        try {
          scoped = await deps.clientFor();
          const client = scoped.client;
          const result = await tool.run(client, args);
          deps.logger.toolCall({
            tool: tool.name,
            subject: currentSubject(),
            upstreamStatus: scoped.status.last,
            durationMs: Math.round(performance.now() - startedAt),
            outcome: result.isError ? 'error' : 'ok'
          });
          return result;
        } catch (error) {
          const upstreamStatus = scoped?.status.last ?? null;

          // Contract §7: an authentication fault is an HTTP-layer challenge,
          // never a tool result the model could mistake for data.
          const asChallenge = (authError: OutboundAuthError): never => {
            deps.logger.toolCall({
              tool: tool.name,
              subject: currentSubject(),
              upstreamStatus: authError.status,
              durationMs: Math.round(performance.now() - startedAt),
              outcome: 'error',
              reason: 'outbound_auth'
            });
            currentRequestContext().setChallenge?.(challengeFor(authError));
            throw authError;
          };

          if (error instanceof OutboundAuthError) asChallenge(error);

          let mapped: ToolResult;
          try {
            mapped = mapUpstreamFailure(error, tool.refFor(args));
          } catch (mappedError) {
            if (mappedError instanceof OutboundAuthError) asChallenge(mappedError);
            throw mappedError;
          }

          deps.logger.toolCall({
            tool: tool.name,
            subject: currentSubject(),
            upstreamStatus,
            durationMs: Math.round(performance.now() - startedAt),
            outcome: 'error',
            reason: 'upstream_failure'
          });
          return mapped;
        }
      }) as never
    );
  }
}
