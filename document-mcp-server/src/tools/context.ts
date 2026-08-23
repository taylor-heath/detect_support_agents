/**
 * Per-request context shared between the transport and the tool handlers.
 *
 * Under Streamable HTTP this carries the caller's identity and a hook for
 * setting a `WWW-Authenticate` challenge on the response. Under stdio there is
 * no HTTP request at all, so handlers must read it defensively — contract §3.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export interface CallerIdentity {
  subject: string;
  scopes: string[];
  /** The verified inbound token, absent under stdio. */
  token?: string;
}

export interface RequestContext {
  caller?: CallerIdentity;
  /** Sets an HTTP-layer challenge header when the transport supports one. */
  setChallenge?: (headerValue: string) => void;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** Never throws: stdio has no request context and that is not an error. */
export function currentRequestContext(): RequestContext {
  return storage.getStore() ?? {};
}

export function currentSubject(): string {
  return storage.getStore()?.caller?.subject ?? 'local';
}
