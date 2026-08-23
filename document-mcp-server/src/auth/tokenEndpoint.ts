/**
 * The OAuth token endpoint client.
 *
 * READ-ONLY EXEMPTION — READ THIS BEFORE EDITING.
 *
 * This is the one file permitted to issue a non-GET request, because OAuth
 * 2.0 mandates POST for the token endpoint (RFC 6749 §3.2). The request goes to
 * *Keycloak*, never to the Document API, and the enforcement script
 * (`scripts/check-readonly.mjs`) allowlists this file by name for that reason
 * while forbidding non-GET anywhere else, `src/upstream/` included.
 *
 * Nothing in this file may take a URL, method, or path from a caller: the
 * endpoint comes from configuration and the grants below are the only two
 * supported. Do not add a general-purpose request helper here — that would turn
 * the exemption into a hole in contract §2.2.
 */

import { OAUTH_REFRESH_TIMEOUT_MS, OAUTH_TIMEOUT_MS, REQUIRED_SCOPE } from '../constants.js';

const TOKEN_EXCHANGE_GRANT = 'urn:ietf:params:oauth:grant-type:token-exchange';

export interface TokenResponse {
  accessToken: string;
  /** Absolute expiry in epoch milliseconds. */
  expiresAtMs: number;
}

export interface TokenEndpointConfig {
  tokenEndpoint: string;
  clientId: string;
  clientSecret?: string;
  /** Requested audience for the Document API. */
  audience?: string;
}

interface RawTokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

async function postForm(
  endpoint: string,
  form: URLSearchParams,
  timeoutMs: number,
  fetchImpl: typeof fetch
): Promise<TokenResponse> {
  const response = await fetchImpl(endpoint, {
    // Mandated by RFC 6749 §3.2. See the exemption note at the top of this file.
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      accept: 'application/json'
    },
    body: form,
    signal: AbortSignal.timeout(timeoutMs)
  });

  const body = (await response.json().catch(() => ({}))) as RawTokenResponse;

  if (!response.ok || !body.access_token) {
    // Never include the form body in the message: it carries the subject token.
    throw new Error(
      `Token endpoint returned ${response.status}${body.error ? ` (${body.error})` : ''}`
    );
  }

  const lifetime = typeof body.expires_in === 'number' ? body.expires_in : 60;
  return {
    accessToken: body.access_token,
    expiresAtMs: Date.now() + lifetime * 1000
  };
}

function credentials(config: TokenEndpointConfig): URLSearchParams {
  const form = new URLSearchParams({ client_id: config.clientId });
  if (config.clientSecret) form.set('client_secret', config.clientSecret);
  return form;
}

/**
 * RFC 8693 token exchange: trades the caller's verified token for one scoped to
 * the Document API audience. The requested scope is always and only
 * `docs:read`, so the exchange can never widen what the caller could do.
 */
export async function exchangeToken(
  config: TokenEndpointConfig,
  subjectToken: string,
  fetchImpl: typeof fetch = fetch
): Promise<TokenResponse> {
  const form = credentials(config);
  form.set('grant_type', TOKEN_EXCHANGE_GRANT);
  form.set('subject_token', subjectToken);
  form.set('subject_token_type', 'urn:ietf:params:oauth:token-type:access_token');
  form.set('requested_token_type', 'urn:ietf:params:oauth:token-type:access_token');
  form.set('scope', REQUIRED_SCOPE);
  if (config.audience) form.set('audience', config.audience);

  return postForm(config.tokenEndpoint, form, OAUTH_TIMEOUT_MS, fetchImpl);
}

/**
 * Client credentials, used only under stdio where there is no inbound token
 * (contract §6). The scope requested is `docs:read` and nothing else, so a
 * client that Keycloak has granted more cannot spend it here.
 */
export async function clientCredentialsToken(
  config: TokenEndpointConfig,
  fetchImpl: typeof fetch = fetch
): Promise<TokenResponse> {
  const form = credentials(config);
  form.set('grant_type', 'client_credentials');
  form.set('scope', REQUIRED_SCOPE);
  if (config.audience) form.set('audience', config.audience);

  return postForm(config.tokenEndpoint, form, OAUTH_REFRESH_TIMEOUT_MS, fetchImpl);
}
