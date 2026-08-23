/**
 * The MCP server instance — contract §3.
 *
 * One `McpServer`, built once, driven by either transport. Nothing below knows
 * which transport it is running under: the caller's identity and the outbound
 * credential both arrive through injected dependencies, so stdio and Streamable
 * HTTP differ only in the file that calls `connect` (acceptance criterion 8).
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { Config } from './config.js';
import type { Logger } from './logging.js';
import { createReadOnlyClient } from './upstream/client.js';
import type { TokenProvider } from './auth/outbound.js';
import { registerReadOnlyTools, type CallScopedClient } from './tools/index.js';

export const SERVER_NAME = 'document-readonly';
export const SERVER_VERSION = '1.0.0';

const INSTRUCTIONS = `Read-only access to the document rendering service.

These tools describe templates and payload schemas, report on render jobs, and
hand back short-lived download links for files a job produced. They cannot
submit, change, retry, or delete anything, and they never return file bytes or a
previously submitted payload — if a task needs any of that, say so rather than
looking for another tool here.

A normal path is: list_templates to choose a template, get_template for its
layouts and styles, get_payload_schema for the payload shape, then
list_render_jobs / get_render_job to check on a render and get_artifact_link for
its output.`;

export interface ServerDeps {
  config: Config;
  logger: Logger;
  /** Supplies the outbound bearer token for one upstream call. */
  getToken: TokenProvider;
  /** Test seam. Never used to vary the HTTP method. */
  fetchImpl?: typeof fetch;
}

export function createDocumentMcpServer(deps: ServerDeps): McpServer {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { capabilities: { tools: {} }, instructions: INSTRUCTIONS }
  );

  registerReadOnlyTools(server, {
    logger: deps.logger,
    clientFor: async (): Promise<CallScopedClient> => {
      const status: { last: number | null } = { last: null };
      const client = createReadOnlyClient({
        baseUrl: deps.config.upstream.baseUrl,
        getToken: deps.getToken,
        logger: deps.logger,
        ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {}),
        onStatus: statusCode => {
          status.last = statusCode;
        }
      });
      return { client, status };
    }
  });

  return server;
}
