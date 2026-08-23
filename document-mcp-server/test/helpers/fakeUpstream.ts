/**
 * A stand-in for the Document API, built from the shapes in openapi.yaml.
 *
 * It asserts the method of every request it receives, so any test that
 * accidentally exercises a write path fails loudly rather than silently.
 */

import type { Config } from '../../src/config.js';

export const BASE_URL = 'https://api.test.local/v1';

export interface RecordedRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  accept: string | null;
  authorization: string | null;
}

export interface FakeUpstream {
  fetchImpl: typeof fetch;
  requests: RecordedRequest[];
  /** Replaces the handler for one path, or a prefix when it ends in `*`. */
  route(pattern: string, handler: () => Response | Promise<Response>): void;
}

export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init
  });
}

export function problem(
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/problem+json', ...headers }
  });
}

export function template(id: string, target = 'pptx'): Record<string, unknown> {
  return {
    id,
    name: `Template ${id}`,
    target,
    description: `A ${target} template`,
    updatedAt: '2026-08-01T10:00:00Z'
  };
}

export function job(index: number, status = 'succeeded'): Record<string, unknown> {
  const id = `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
  return {
    id,
    status,
    target: 'pptx',
    templateId: 'corp-16x9',
    title: `Quarterly review deck ${index}`,
    createdAt: '2026-08-20T09:00:00Z',
    completedAt: '2026-08-20T09:00:12Z',
    submittedBy: 'user-should-not-be-returned'
  };
}

export function createFakeUpstream(): FakeUpstream {
  const requests: RecordedRequest[] = [];
  const routes = new Map<string, () => Response | Promise<Response>>();

  routes.set('/templates', () =>
    json({ items: [template('corp-16x9'), template('memo-a4', 'docx')], nextCursor: null })
  );
  routes.set('/schemas', () => json({ items: [{ id: 'pptx/v1', target: 'pptx', version: 1 }] }));

  const fetchImpl = (async (
    input: Request | string | URL,
    init?: RequestInit
  ): Promise<Response> => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url);

    if (request.method !== 'GET') {
      throw new Error(
        `Fake upstream received ${request.method} ${url.pathname} — the server must only ever GET`
      );
    }

    const path = url.pathname.replace('/v1', '');

    requests.push({
      method: request.method,
      path,
      query: Object.fromEntries(url.searchParams.entries()),
      accept: request.headers.get('accept'),
      authorization: request.headers.get('authorization')
    });

    const handler =
      routes.get(path) ??
      [...routes.entries()]
        .filter(([pattern]) => pattern.endsWith('*'))
        .find(([pattern]) => path.startsWith(pattern.slice(0, -1)))?.[1];

    if (!handler) {
      return problem(404, { type: 'about:blank', title: 'Not Found', status: 404 });
    }
    return handler();
  }) as unknown as typeof fetch;

  return {
    fetchImpl,
    requests,
    route(pattern, handler) {
      routes.set(pattern, handler);
    }
  };
}

export function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    upstream: { baseUrl: BASE_URL },
    inboundAuth: {
      issuerUrl: 'https://auth.test.local/realms/docs',
      jwksUri: 'https://auth.test.local/realms/docs/protocol/openid-connect/certs',
      ignoredScopes: ['openid', 'profile', 'email', 'offline_access']
    },
    outboundAuth: {
      mode: 'forward',
      tokenEndpoint: 'https://auth.test.local/realms/docs/protocol/openid-connect/token',
      clientId: 'docs-mcp'
    },
    http: {
      host: '127.0.0.1',
      port: 0,
      mcpPath: '/mcp',
      resourceUrl: 'https://mcp.test.local/mcp'
    },
    logLevel: 'error',
    ...overrides
  };
}
