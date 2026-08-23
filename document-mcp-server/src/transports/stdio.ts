/**
 * stdio transport — contract §3.
 *
 * Local development and desktop hosts. There is no inbound token here, so the
 * server uses locally configured `docs:read` credentials (contract §6) and
 * handlers see no caller identity at all — which is why they read it
 * defensively rather than assuming it exists.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadConfig } from '../config.js';
import { createLogger } from '../logging.js';
import { createLocalTokenProvider } from '../auth/outbound.js';
import { createDocumentMcpServer, SERVER_NAME, SERVER_VERSION } from '../server.js';

export async function runStdio(): Promise<void> {
  const config = loadConfig('stdio');
  const logger = createLogger(config.logLevel);

  const server = createDocumentMcpServer({
    config,
    logger,
    getToken: createLocalTokenProvider(config.outboundAuth)
  });

  await server.connect(new StdioServerTransport());
  logger.info('server_started', {
    transport: 'stdio',
    server: `${SERVER_NAME}@${SERVER_VERSION}`,
    upstream: config.upstream.baseUrl
  });
}
