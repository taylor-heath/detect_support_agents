/**
 * Values fixed by the build contract. These are deliberately NOT configurable:
 * a deployment cannot widen the scope, raise the result ceiling, or lengthen
 * the upstream timeout by changing the environment.
 */

/** Contract §2.3 / §6 — the only scope this server ever asks for or accepts. */
export const REQUIRED_SCOPE = 'docs:read';

/** Contract §5 — a single tool result must not exceed 25 KB of text. */
export const MAX_RESULT_BYTES = 25 * 1024;

/** Contract §8 — upstream Document API calls time out at 10 s. */
export const UPSTREAM_TIMEOUT_MS = 10_000;

/** Contract §8 — OAuth discovery and token endpoints must answer within 10 s. */
export const OAUTH_TIMEOUT_MS = 10_000;

/** Contract §8 — a token refresh gets a longer budget than a first call. */
export const OAUTH_REFRESH_TIMEOUT_MS = 30_000;

/** Contract §6 — JWKS is cached with a bounded refresh interval. */
export const JWKS_CACHE_MAX_AGE_MS = 10 * 60_000;
export const JWKS_COOLDOWN_MS = 30_000;

/** Contract §7 — a 429 is retried inline only when Retry-After is short. */
export const RETRY_AFTER_INLINE_LIMIT_MS = 5_000;

/** Contract §4 — six tools. A seventh requires an amendment to the contract. */
export const MAX_TOOLS = 6;
