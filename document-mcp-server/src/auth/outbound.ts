/**
 * Outbound credentials — contract §6.
 *
 * Three strategies, all of them bounded by the caller's own permissions:
 *   - `forward`   — pass the verified inbound token upstream unchanged.
 *   - `exchange`  — RFC 8693 exchange for a token scoped to the API audience.
 *   - `local`     — stdio only, where no inbound token exists; client
 *                   credentials with `docs:read`.
 *
 * A service account that elevates beyond the caller is explicitly not
 * acceptable, so `forward` and `exchange` both refuse to fall back to local
 * credentials when the inbound token is missing.
 */

import type { OutboundAuthConfig } from '../config.js';
import { OutboundAuthError } from '../upstream/errors.js';
import { clientCredentialsToken, exchangeToken, type TokenEndpointConfig } from './tokenEndpoint.js';
import { currentRequestContext } from '../tools/context.js';
import { createHash } from 'node:crypto';

export type TokenProvider = () => Promise<string>;

/** Refresh a little before expiry so an in-flight call cannot use a dead token. */
const EXPIRY_MARGIN_MS = 30_000;

interface CacheEntry {
  accessToken: string;
  expiresAtMs: number;
}

function endpointConfig(config: OutboundAuthConfig): TokenEndpointConfig {
  if (!config.clientId) {
    throw new Error('DOCS_MCP_CLIENT_ID is required for this outbound token mode');
  }
  return {
    tokenEndpoint: config.tokenEndpoint,
    clientId: config.clientId,
    ...(config.clientSecret ? { clientSecret: config.clientSecret } : {}),
    ...(config.apiAudience ? { audience: config.apiAudience } : {})
  };
}

/**
 * HTTP transport: derives the upstream credential from the caller's own token.
 * Exchange results are cached per inbound token — keyed by a digest, so the
 * token itself is never used as a map key that could end up in a heap dump
 * label or log line.
 */
export function createCallerTokenProvider(config: OutboundAuthConfig, fetchImpl: typeof fetch = fetch): TokenProvider {
  const cache = new Map<string, CacheEntry>();

  return async (): Promise<string> => {
    const caller = currentRequestContext().caller;
    if (!caller?.token) {
      throw new OutboundAuthError(
        401,
        'No verified caller token is available for the upstream call'
      );
    }

    if (config.mode === 'forward') {
      return caller.token;
    }

    const key = createHash('sha256').update(caller.token).digest('hex');
    const cached = cache.get(key);
    if (cached && cached.expiresAtMs - EXPIRY_MARGIN_MS > Date.now()) {
      return cached.accessToken;
    }

    try {
      const exchanged = await exchangeToken(endpointConfig(config), caller.token, fetchImpl);
      cache.set(key, exchanged);
      // Bound the cache: it is keyed by token, and tokens keep arriving.
      if (cache.size > 500) {
        for (const [entryKey, entry] of cache) {
          if (entry.expiresAtMs <= Date.now()) cache.delete(entryKey);
        }
      }
      return exchanged.accessToken;
    } catch (error) {
      throw new OutboundAuthError(
        403,
        `Token exchange failed: ${error instanceof Error ? error.message : 'unknown error'}`
      );
    }
  };
}

/**
 * stdio transport: locally configured credentials with `docs:read`, cached
 * until shortly before they expire.
 */
export function createLocalTokenProvider(
  config: OutboundAuthConfig,
  fetchImpl: typeof fetch = fetch
): TokenProvider {
  let cached: CacheEntry | undefined;
  let inFlight: Promise<CacheEntry> | undefined;

  return async (): Promise<string> => {
    if (cached && cached.expiresAtMs - EXPIRY_MARGIN_MS > Date.now()) {
      return cached.accessToken;
    }
    inFlight ??= clientCredentialsToken(endpointConfig(config), fetchImpl)
      .then(token => {
        cached = token;
        return token;
      })
      .finally(() => {
        inFlight = undefined;
      });

    const token = await inFlight;
    return token.accessToken;
  };
}
