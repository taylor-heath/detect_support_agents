/**
 * Upstream failures, modelled so the tool layer can map them to the results
 * required by contract §7 without re-parsing HTTP.
 */

/** RFC 9457 problem detail, as returned by the Document API. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Array<{ pointer?: string; message?: string }>;
}

export class UpstreamError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail | undefined;
  /** Retry-After in milliseconds, when the response carried one. */
  readonly retryAfterMs: number | undefined;

  constructor(
    status: number,
    message: string,
    problem?: ProblemDetail,
    retryAfterMs?: number
  ) {
    super(message);
    this.name = 'UpstreamError';
    this.status = status;
    this.problem = problem;
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * A transport-level failure: DNS, TLS, connection reset, or the 10 s timeout.
 * Distinct from UpstreamError because there is no status or problem detail.
 */
export class UpstreamTransportError extends Error {
  override readonly cause: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'UpstreamTransportError';
    this.cause = cause;
  }
}

/**
 * Raised when the caller's token cannot be turned into an upstream credential.
 * Surfaces as an HTTP-layer challenge, not a tool result (contract §7).
 */
export class OutboundAuthError extends Error {
  readonly status: 401 | 403;

  constructor(status: 401 | 403, message: string) {
    super(message);
    this.name = 'OutboundAuthError';
    this.status = status;
  }
}

export function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(header);
  if (!Number.isNaN(date)) return Math.max(0, date - Date.now());
  return undefined;
}
