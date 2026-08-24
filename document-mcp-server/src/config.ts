/**
 * Configuration is read from the environment only — contract §8, "no secrets in
 * source". Nothing here has a hostname, client id, or secret baked in.
 */

export type OutboundTokenMode = 'forward' | 'exchange';

export interface UpstreamConfig {
  /** Base URL of the Document Service API, including its version path. */
  baseUrl: string;
}

export interface InboundAuthConfig {
  /** Keycloak realm issuer, e.g. https://auth.example.com/realms/docs */
  issuerUrl: string;
  /** JWKS endpoint; derived from the issuer when not set explicitly. */
  jwksUri: string;
  /** Expected `aud` of inbound tokens. Unset disables the audience check. */
  audience?: string;
  /**
   * Scopes that carry no capability and are therefore ignored when checking
   * that a token is not broader than `docs:read` (contract §2.3).
   */
  ignoredScopes: string[];
}

export interface OutboundAuthConfig {
  /**
   * `forward` passes the caller's verified token upstream unchanged.
   * `exchange` trades it (RFC 8693) for one scoped to the API audience.
   * Both are acceptable per contract §6; a privilege-elevating service
   * account is not, so neither mode ever asks for more than `docs:read`.
   */
  mode: OutboundTokenMode;
  tokenEndpoint: string;
  clientId?: string;
  clientSecret?: string;
  /** `aud` requested for the upstream API in exchange mode. */
  apiAudience?: string;
}

export interface HttpTransportConfig {
  host: string;
  port: number;
  /** Path the Streamable HTTP endpoint is served on. */
  mcpPath: string;
  /**
   * The URL the host was configured with, verbatim. Contract §6 requires the
   * protected resource metadata `resource` field to match it exactly, path
   * included, so it is configured rather than reconstructed from request
   * headers (which a proxy can rewrite).
   */
  resourceUrl: string;
}

export interface Config {
  upstream: UpstreamConfig;
  inboundAuth: InboundAuthConfig;
  outboundAuth: OutboundAuthConfig;
  http: HttpTransportConfig;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

class ConfigError extends Error {}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value || value.trim() === '') {
    // Node does not read .env files on its own, and this server deliberately
    // has no dotenv dependency, so say where values are actually expected from.
    throw new ConfigError(
      `Missing required environment variable ${name}. Values are read from the process environment; ` +
        'a .env file is only loaded when Node is started with --env-file (the npm start:* and dev:* ' +
        'scripts pass --env-file-if-exists=.env for you).'
    );
  }
  return value.trim();
}

function optional(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name];
  return value && value.trim() !== '' ? value.trim() : undefined;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

const DEFAULT_IGNORED_SCOPES = ['openid', 'profile', 'email', 'offline_access'];

/**
 * Reads the inbound/outbound auth and upstream settings. `transport` decides
 * which fields are mandatory: stdio needs local credentials and no resource
 * URL, HTTP needs the reverse.
 */
export function loadConfig(
  transport: 'stdio' | 'http',
  env: NodeJS.ProcessEnv = process.env
): Config {
  const issuerUrl = stripTrailingSlash(required(env, 'DOCS_MCP_ISSUER_URL'));
  const mode = (optional(env, 'DOCS_MCP_OUTBOUND_TOKEN_MODE') ?? 'forward') as OutboundTokenMode;
  if (mode !== 'forward' && mode !== 'exchange') {
    throw new ConfigError(
      `DOCS_MCP_OUTBOUND_TOKEN_MODE must be "forward" or "exchange", got "${mode}"`
    );
  }

  // stdio has no inbound token to forward, so it always needs local credentials.
  const needsClientCredentials = transport === 'stdio' || mode === 'exchange';

  const config: Config = {
    upstream: {
      baseUrl: stripTrailingSlash(required(env, 'DOCS_API_BASE_URL'))
    },
    inboundAuth: {
      issuerUrl,
      jwksUri:
        optional(env, 'DOCS_MCP_JWKS_URI') ??
        `${issuerUrl}/protocol/openid-connect/certs`,
      audience: optional(env, 'DOCS_MCP_AUDIENCE'),
      ignoredScopes: (
        optional(env, 'DOCS_MCP_IGNORED_SCOPES')?.split(/[\s,]+/) ?? DEFAULT_IGNORED_SCOPES
      ).filter(Boolean)
    },
    outboundAuth: {
      mode,
      tokenEndpoint:
        optional(env, 'DOCS_MCP_TOKEN_ENDPOINT') ??
        `${issuerUrl}/protocol/openid-connect/token`,
      clientId: needsClientCredentials
        ? required(env, 'DOCS_MCP_CLIENT_ID')
        : optional(env, 'DOCS_MCP_CLIENT_ID'),
      clientSecret: optional(env, 'DOCS_MCP_CLIENT_SECRET'),
      apiAudience: mode === 'exchange' ? required(env, 'DOCS_API_AUDIENCE') : optional(env, 'DOCS_API_AUDIENCE')
    },
    http: {
      host: optional(env, 'DOCS_MCP_HOST') ?? '0.0.0.0',
      port: Number(optional(env, 'DOCS_MCP_PORT') ?? '3000'),
      mcpPath: optional(env, 'DOCS_MCP_PATH') ?? '/mcp',
      resourceUrl:
        transport === 'http'
          ? stripTrailingSlash(required(env, 'DOCS_MCP_RESOURCE_URL'))
          : (optional(env, 'DOCS_MCP_RESOURCE_URL') ?? '')
    },
    logLevel: (optional(env, 'DOCS_MCP_LOG_LEVEL') ?? 'info') as Config['logLevel']
  };

  if (transport === 'http' && !Number.isInteger(config.http.port)) {
    throw new ConfigError(`DOCS_MCP_PORT must be an integer, got "${env.DOCS_MCP_PORT}"`);
  }

  return config;
}

export { ConfigError };
