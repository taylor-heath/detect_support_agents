/**
 * Mapping upstream failures onto tool results — contract §7.
 *
 * Everything the model can react to comes back as an ordinary result with
 * `isError: true`, so it can read the failure and adapt. Only authentication
 * and protocol faults are raised as errors, which end the exchange.
 */

import { UpstreamError, UpstreamTransportError, OutboundAuthError } from '../upstream/errors.js';
import { RETRY_AFTER_INLINE_LIMIT_MS } from '../constants.js';

export interface ToolResult {
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function toolOk(text: string): ToolResult {
  return { content: [{ type: 'text', text }] };
}

export function toolError(text: string): ToolResult {
  return { content: [{ type: 'text', text }], isError: true };
}

/** Human-readable name of the thing that was being fetched. */
export interface ResourceRef {
  kind: 'template' | 'payload schema' | 'render job' | 'artifact';
  id: string;
}

function pointerLines(error: UpstreamError): string[] {
  const pointers = (error.problem?.errors ?? [])
    .filter(entry => entry.pointer || entry.message)
    .map(entry =>
      entry.pointer
        ? `  - ${entry.pointer}: ${entry.message ?? 'invalid'}`
        : `  - ${entry.message}`
    );
  return pointers.length > 0 ? ['Problems reported:', ...pointers] : [];
}

/**
 * Turns an upstream failure into a tool result, or rethrows when the failure is
 * an authentication fault that must surface at the HTTP layer instead.
 */
export function mapUpstreamFailure(error: unknown, ref: ResourceRef): ToolResult {
  if (error instanceof UpstreamTransportError) {
    return toolError(
      `The document service could not be reached (${error.message}). The request was not retried further; try again shortly.`
    );
  }

  if (!(error instanceof UpstreamError)) {
    throw error;
  }

  switch (error.status) {
    case 400:
      return toolError(
        [
          `The document service rejected the request as invalid: ${error.message}`,
          ...pointerLines(error)
        ].join('\n')
      );

    // Contract §7: propagate as an HTTP-layer challenge, never as a tool result.
    case 401:
      throw new OutboundAuthError(401, 'The document service rejected the forwarded token');
    case 403:
      throw new OutboundAuthError(
        403,
        'The forwarded token lacks the docs:read scope at the document service'
      );

    case 404:
      return toolError(
        `No such ${ref.kind} — check the identifier "${ref.id}". Listing tools show valid identifiers.`
      );

    case 410:
      return toolError(
        `That ${ref.kind} has expired and its bytes are no longer retrievable. Artifacts are removed after their retention window; the job record may still describe it.`
      );

    case 429:
      return toolError(
        error.retryAfterMs !== undefined && error.retryAfterMs > RETRY_AFTER_INLINE_LIMIT_MS
          ? `The document service is rate limiting this client. Retry in about ${Math.ceil(error.retryAfterMs / 1000)} seconds.`
          : 'The document service is rate limiting this client. One retry was already attempted; wait before trying again.'
      );

    default:
      if (error.status >= 500) {
        return toolError(
          `The document service returned ${error.status} (${error.message}). One retry was already attempted.`
        );
      }
      return toolError(`The document service returned ${error.status}: ${error.message}`);
  }
}
