/**
 * Prints the registered tool surface as JSON, for `check-readonly.mjs` to
 * assert against. It goes through the real registration path — a tool that the
 * server would expose is a tool this probe sees.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerReadOnlyTools } from '../src/tools/index.js';
import { silentLogger } from '../src/logging.js';

const server = new McpServer({ name: 'probe', version: '0.0.0' }, { capabilities: { tools: {} } });

registerReadOnlyTools(server, {
  logger: silentLogger,
  clientFor: async () => {
    throw new Error('the probe never calls a tool');
  }
});

// `_registeredTools` is the SDK's own record of what a client would be told.
const registered = (server as unknown as { _registeredTools: Record<string, { description?: string; annotations?: Record<string, unknown> }> })._registeredTools;

process.stdout.write(
  JSON.stringify(
    Object.entries(registered).map(([name, tool]) => ({
      name,
      description: tool.description ?? '',
      annotations: tool.annotations ?? {}
    })),
    null,
    2
  )
);
