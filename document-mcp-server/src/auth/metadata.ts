/**
 * RFC 9728 protected resource metadata — contract §6.
 *
 * The `resource` field must match the URL the host was configured with exactly,
 * path included, or Claude's connector flow rejects the server. It is therefore
 * echoed verbatim from configuration and never rebuilt from request headers,
 * which a reverse proxy is free to rewrite.
 *
 * The document is served at both the bare well-known path and the
 * path-suffixed form (RFC 9728 §3.1), because clients differ in which they
 * probe for a resource that lives under a path.
 */

import { Router, type Request, type Response } from 'express';
import { REQUIRED_SCOPE } from '../constants.js';

export interface ProtectedResourceMetadata {
  resource: string;
  authorization_servers: string[];
  scopes_supported: string[];
  bearer_methods_supported: string[];
  resource_name?: string;
  resource_documentation?: string;
}

export interface MetadataOptions {
  /** The configured MCP endpoint URL, verbatim. */
  resourceUrl: string;
  /** Keycloak realm issuer. */
  issuerUrl: string;
  resourceName?: string;
  documentationUrl?: string;
}

export function buildProtectedResourceMetadata(
  options: MetadataOptions
): ProtectedResourceMetadata {
  return {
    resource: options.resourceUrl,
    authorization_servers: [options.issuerUrl],
    scopes_supported: [REQUIRED_SCOPE],
    bearer_methods_supported: ['header'],
    ...(options.resourceName ? { resource_name: options.resourceName } : {}),
    ...(options.documentationUrl ? { resource_documentation: options.documentationUrl } : {})
  };
}

/** The metadata URL to advertise in `WWW-Authenticate` challenges. */
export function protectedResourceMetadataUrl(resourceUrl: string): string {
  const url = new URL(resourceUrl);
  const path = url.pathname === '/' ? '' : url.pathname.replace(/\/$/, '');
  return new URL(`/.well-known/oauth-protected-resource${path}`, url).href;
}

export function protectedResourceMetadataRouter(options: MetadataOptions): Router {
  const router = Router();
  const document = buildProtectedResourceMetadata(options);
  const path = new URL(options.resourceUrl).pathname.replace(/\/$/, '');

  const handler = (_req: Request, res: Response): void => {
    res.set('cache-control', 'public, max-age=3600');
    res.json(document);
  };

  router.get('/.well-known/oauth-protected-resource', handler);
  if (path && path !== '') {
    router.get(`/.well-known/oauth-protected-resource${path}`, handler);
  }

  return router;
}
