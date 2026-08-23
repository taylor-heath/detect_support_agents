/**
 * The outbound Document API client — contract §2.2.
 *
 * READ-ONLY BY CONSTRUCTION. This module is the only place in the server that
 * talks to the Document API, and the only operation it exposes is `get`. There
 * is no method parameter to pass, no request-builder to reuse, and no escape
 * hatch: a contributor adding a `create_job` tool has nothing to call.
 *
 * Three layers hold that guarantee up:
 *   1. `ReadOnlyHttpClient` has exactly one member, `get`. A caller cannot name
 *      another verb, so a write attempt fails to typecheck.
 *   2. The single dispatch site below hardcodes `HTTP_GET` and asserts the
 *      constructed Request's method before it goes out, so a write cannot slip
 *      through at runtime either.
 *   3. `scripts/check-readonly.mjs` fails CI if any other HTTP method appears
 *      anywhere under `src/upstream/`.
 *
 * Do not add a method parameter to this file. That is a contract violation
 * (§2.1–2.2), not a refactor.
 */

import { UPSTREAM_TIMEOUT_MS } from '../constants.js';
import type { Logger } from '../logging.js';
import {
  UpstreamError,
  UpstreamTransportError,
  parseRetryAfter,
  type ProblemDetail
} from './errors.js';
import { RETRY_AFTER_INLINE_LIMIT_MS } from '../constants.js';

/** The only HTTP method reachable from this server. */
const HTTP_GET = 'GET' as const;

export type QueryValue = string | number | boolean | undefined | null;

export interface GetOptions {
  /** Query parameters. Undefined and null values are dropped. */
  params?: Record<string, QueryValue>;
  /** Overrides the default `application/json` Accept header. */
  accept?: string;
}

export interface UpstreamResponse<T> {
  status: number;
  data: T;
}

/**
 * The entire outbound surface. One function, one verb.
 */
export interface ReadOnlyHttpClient {
  get<T = unknown>(path: string, options?: GetOptions): Promise<UpstreamResponse<T>>;
}

/** Supplies the bearer token for one outbound call. */
export type TokenProvider = () => Promise<string>;

export interface ClientDeps {
  baseUrl: string;
  getToken: TokenProvider;
  logger: Logger;
  /** Injection point for tests. Never used to change the method. */
  fetchImpl?: typeof fetch;
  /** Observability hook: reports the status of each upstream attempt. */
  onStatus?: (status: number) => void;
  sleep?: (ms: number) => Promise<void>;
  /** Jitter in ms for the single 5xx retry; injectable so tests are stable. */
  jitter?: () => number;
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

function buildUrl(baseUrl: string, path: string, params?: Record<string, QueryValue>): URL {
  if (!path.startsWith('/')) {
    throw new Error(`Upstream path must start with "/", got "${path}"`);
  }
  const url = new URL(`${baseUrl}${path}`);
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
  return url;
}

async function readProblem(response: Response): Promise<ProblemDetail | undefined> {
  try {
    const text = await response.text();
    if (!text) return undefined;
    const parsed: unknown = JSON.parse(text);
    return typeof parsed === 'object' && parsed !== null ? (parsed as ProblemDetail) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Builds the read-only client. The returned object is frozen so no caller can
 * bolt a `post` onto it after the fact.
 */
export function createReadOnlyClient(deps: ClientDeps): ReadOnlyHttpClient {
  const doFetch = deps.fetchImpl ?? fetch;
  const sleep = deps.sleep ?? defaultSleep;
  const jitter = deps.jitter ?? ((): number => Math.floor(Math.random() * 250));

  const attempt = async (url: URL, accept: string): Promise<Response> => {
    const token = await deps.getToken();
    const request = new Request(url, {
      method: HTTP_GET,
      headers: {
        accept,
        authorization: `Bearer ${token}`
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });

    // Runtime backstop for layer (1): if anything ever constructs a non-GET
    // request here, it dies before reaching the network.
    if (request.method !== HTTP_GET) {
      throw new Error(
        `Read-only violation: attempted ${request.method} on the Document API. See contract §2.2.`
      );
    }

    try {
      return await doFetch(request);
    } catch (cause) {
      const reason =
        cause instanceof Error && cause.name === 'TimeoutError'
          ? `Upstream call exceeded ${UPSTREAM_TIMEOUT_MS} ms`
          : 'Upstream call failed before a response was received';
      throw new UpstreamTransportError(reason, cause);
    }
  };

  const get = async <T>(path: string, options: GetOptions = {}): Promise<UpstreamResponse<T>> => {
    const url = buildUrl(deps.baseUrl, path, options.params);
    const accept = options.accept ?? 'application/json';

    let response = await attempt(url, accept);
    deps.onStatus?.(response.status);

    // Contract §7: one retry for a short 429, one jittered retry for 5xx.
    if (response.status === 429) {
      const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
      if (retryAfterMs !== undefined && retryAfterMs <= RETRY_AFTER_INLINE_LIMIT_MS) {
        deps.logger.debug('upstream_retry', { reason: 'rate_limited', waitMs: retryAfterMs });
        await sleep(retryAfterMs);
        response = await attempt(url, accept);
        deps.onStatus?.(response.status);
      }
    } else if (response.status >= 500) {
      const waitMs = jitter();
      deps.logger.debug('upstream_retry', { reason: 'server_error', waitMs });
      await sleep(waitMs);
      response = await attempt(url, accept);
      deps.onStatus?.(response.status);
    }

    if (!response.ok) {
      const problem = await readProblem(response);
      throw new UpstreamError(
        response.status,
        problem?.detail ?? problem?.title ?? `Upstream responded ${response.status}`,
        problem,
        parseRetryAfter(response.headers.get('retry-after'))
      );
    }

    const text = await response.text();
    const data = (text ? JSON.parse(text) : undefined) as T;
    return { status: response.status, data };
  };

  return Object.freeze({ get });
}
