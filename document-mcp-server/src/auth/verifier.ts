/**
 * Inbound token verification — contract §6.
 *
 * The server is an OAuth *resource* server only: it verifies tokens against the
 * Keycloak realm's JWKS and never issues one (contract §2.5). There is no
 * authorization-server router mounted anywhere in this codebase.
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { InsufficientScopeError, InvalidTokenError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';
import type { OAuthTokenVerifier } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import { JWKS_CACHE_MAX_AGE_MS, JWKS_COOLDOWN_MS, REQUIRED_SCOPE } from '../constants.js';
import type { InboundAuthConfig } from '../config.js';

function scopesOf(payload: JWTPayload): string[] {
  const fromScope =
    typeof payload.scope === 'string' ? payload.scope.split(/\s+/).filter(Boolean) : [];
  const fromScp = Array.isArray(payload.scp)
    ? payload.scp.filter((entry): entry is string => typeof entry === 'string')
    : [];
  return [...new Set([...fromScope, ...fromScp])];
}

export interface VerifierOptions {
  config: InboundAuthConfig;
  /** Test seam: supplies a key resolver instead of fetching JWKS. */
  keyResolver?: Parameters<typeof jwtVerify>[1];
}

/**
 * Verifies a bearer token and rejects anything broader than `docs:read`.
 *
 * Contract §2.3 is a property of the deployment, not of the tool list: a token
 * that carries write capability is refused outright rather than used for reads,
 * so this server can never be the thing that spends a broader grant.
 */
export function createTokenVerifier(options: VerifierOptions): OAuthTokenVerifier {
  const { config } = options;
  const jwks =
    options.keyResolver ??
    createRemoteJWKSet(new URL(config.jwksUri), {
      cacheMaxAge: JWKS_CACHE_MAX_AGE_MS,
      cooldownDuration: JWKS_COOLDOWN_MS
    });

  const ignored = new Set(config.ignoredScopes);

  return {
    async verifyAccessToken(token: string): Promise<AuthInfo> {
      let payload: JWTPayload;
      try {
        const verified = await jwtVerify(token, jwks, {
          issuer: config.issuerUrl,
          ...(config.audience ? { audience: config.audience } : {})
        });
        payload = verified.payload;
      } catch (error) {
        throw new InvalidTokenError(
          error instanceof Error ? `Token verification failed: ${error.message}` : 'Token verification failed'
        );
      }

      // Contract §6: an unset expiry is treated as an invalid token.
      if (typeof payload.exp !== 'number' || Number.isNaN(payload.exp)) {
        throw new InvalidTokenError('Token has no exp claim');
      }

      const scopes = scopesOf(payload);

      if (!scopes.includes(REQUIRED_SCOPE)) {
        throw new InsufficientScopeError(`Token lacks the required ${REQUIRED_SCOPE} scope`);
      }

      const broader = scopes.filter(scope => scope !== REQUIRED_SCOPE && !ignored.has(scope));
      if (broader.length > 0) {
        throw new InsufficientScopeError(
          `Token carries scopes beyond ${REQUIRED_SCOPE} (${broader.join(' ')}); this server accepts read-only tokens only`
        );
      }

      return {
        token,
        clientId:
          (typeof payload.azp === 'string' && payload.azp) ||
          (typeof payload.client_id === 'string' && payload.client_id) ||
          (typeof payload.sub === 'string' && payload.sub) ||
          'unknown',
        scopes,
        expiresAt: payload.exp,
        extra: { sub: typeof payload.sub === 'string' ? payload.sub : 'unknown' }
      };
    }
  };
}
