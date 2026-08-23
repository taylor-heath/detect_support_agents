/**
 * Streamable HTTP transport — contract §3.
 *
 * The remote connector surface for Claude.ai. Stateless by construction
 * (contract §8): a transport is created per request and discarded with it, so
 * there is no session affinity and any instance can serve any request.
 *
 * The server is an OAuth resource server only (contract §2.5) — it mounts token
 * verification and the RFC 9728 metadata document, and no authorization
 * endpoints whatsoever.
 */

import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { requireBearerAuth } from '@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js';
import type { OAuthTokenVerifier } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import type { Config } from '../config.js';
import { createLogger, type Logger } from '../logging.js';
import { loadConfig } from '../config.js';
import { REQUIRED_SCOPE } from '../constants.js';
import { createTokenVerifier } from '../auth/verifier.js';
import { createCallerTokenProvider } from '../auth/outbound.js';
import { protectedResourceMetadataRouter, protectedResourceMetadataUrl } from '../auth/metadata.js';
import { runWithRequestContext } from '../tools/context.js';
import { createDocumentMcpServer, SERVER_NAME, SERVER_VERSION } from '../server.js';

export interface HttpAppDeps {
  config: Config;
  logger: Logger;
  /** Injectable so tests can verify tokens without a live Keycloak. */
  verifier?: OAuthTokenVerifier;
  fetchImpl?: typeof fetch;
}

export function createHttpApp(deps: HttpAppDeps): Express {
  const { config, logger } = deps;
  const app = express();
  app.disable('x-powered-by');

  const metadataUrl = protectedResourceMetadataUrl(config.http.resourceUrl);

  // Unauthenticated, per RFC 9728: a client must be able to discover where to
  // get a token before it has one.
  app.use(
    protectedResourceMetadataRouter({
      resourceUrl: config.http.resourceUrl,
      issuerUrl: config.inboundAuth.issuerUrl,
      resourceName: 'Document Service (read-only)'
    })
  );

  // Liveness for the deployment platform. Deliberately local: it does not call
  // the Document API, so this server never becomes a hop the API depends on
  // (contract §3).
  app.get('/healthz', (_req: Request, res: Response) => {
    res.json({ status: 'ok', server: SERVER_NAME, version: SERVER_VERSION });
  });

  const verifier = deps.verifier ?? createTokenVerifier({ config: config.inboundAuth });
  const getToken = createCallerTokenProvider(
    config.outboundAuth,
    deps.fetchImpl ?? fetch
  );

  const server = createDocumentMcpServer({
    config,
    logger,
    getToken,
    ...(deps.fetchImpl ? { fetchImpl: deps.fetchImpl } : {})
  });

  const requireAuth = requireBearerAuth({
    verifier,
    requiredScopes: [REQUIRED_SCOPE],
    resourceMetadataUrl: metadataUrl
  });

  app.post(
    config.http.mcpPath,
    express.json({ limit: '4mb' }),
    requireAuth,
    async (req: Request, res: Response, next: NextFunction) => {
      const auth = req.auth;
      const subject =
        (typeof auth?.extra?.sub === 'string' ? auth.extra.sub : undefined) ??
        auth?.clientId ??
        'unknown';

      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
      });

      res.on('close', () => {
        void transport.close();
      });

      try {
        await runWithRequestContext(
          {
            caller: {
              subject,
              scopes: auth?.scopes ?? [],
              ...(auth?.token ? { token: auth.token } : {})
            },
            // Set before the transport writes the response, so an upstream
            // authentication fault still reaches the client as a challenge.
            setChallenge: headerValue => {
              if (!res.headersSent) {
                res.setHeader(
                  'WWW-Authenticate',
                  `${headerValue}, resource_metadata="${metadataUrl}"`
                );
              }
            }
          },
          async () => {
            await server.connect(transport);
            await transport.handleRequest(req, res, req.body);
          }
        );
      } catch (error) {
        logger.error('mcp_request_failed', {
          reason: error instanceof Error ? error.message : 'unknown'
        });
        next(error);
      }
    }
  );

  // Stateless: there is no stream to resume and no session to delete.
  app.all(config.http.mcpPath, (_req: Request, res: Response) => {
    res.set('allow', 'POST').status(405).json({
      error: 'method_not_allowed',
      error_description: 'This endpoint is stateless; use POST for JSON-RPC requests.'
    });
  });

  return app;
}

export async function runHttp(): Promise<void> {
  const config = loadConfig('http');
  const logger = createLogger(config.logLevel);
  const app = createHttpApp({ config, logger });

  await new Promise<void>(resolve => {
    app.listen(config.http.port, config.http.host, () => {
      logger.info('server_started', {
        transport: 'streamable-http',
        server: `${SERVER_NAME}@${SERVER_VERSION}`,
        resource: config.http.resourceUrl,
        upstream: config.upstream.baseUrl,
        outboundTokenMode: config.outboundAuth.mode
      });
      resolve();
    });
  });
}
