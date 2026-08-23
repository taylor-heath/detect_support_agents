/**
 * Acceptance criteria 4, 5 and 6: an unauthenticated Streamable HTTP request
 * gets a 401 with a `resource_metadata` challenge, a token with scopes other
 * than `docs:read` gets 403 insufficient_scope, and the protected resource
 * metadata document's `resource` matches the configured URL exactly.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { InsufficientScopeError, InvalidTokenError } from '@modelcontextprotocol/sdk/server/auth/errors.js';
import type { OAuthTokenVerifier } from '@modelcontextprotocol/sdk/server/auth/provider.js';
import { createHttpApp } from '../src/transports/http.js';
import { buildProtectedResourceMetadata, protectedResourceMetadataUrl } from '../src/auth/metadata.js';
import { silentLogger } from '../src/logging.js';
import { createFakeUpstream, job, json, testConfig } from './helpers/fakeUpstream.js';

const RESOURCE_URL = 'https://mcp.test.local/mcp';

/** Stands in for Keycloak: "read-token" is valid, "wide-token" is too broad. */
const verifier: OAuthTokenVerifier = {
  async verifyAccessToken(token) {
    if (token === 'read-token') {
      return {
        token,
        clientId: 'docs-mcp-client',
        scopes: ['docs:read'],
        expiresAt: Math.floor(Date.now() / 1000) + 300,
        extra: { sub: 'user-42' }
      };
    }
    if (token === 'wide-token') {
      throw new InsufficientScopeError('Token carries scopes beyond docs:read (docs:write)');
    }
    throw new InvalidTokenError('Token verification failed');
  }
};

let server: Server;
let baseUrl: string;
const upstream = createFakeUpstream();

beforeAll(async () => {
  upstream.route('/jobs', () => json({ items: [job(1)], nextCursor: null }));

  const app = createHttpApp({
    config: testConfig(),
    logger: silentLogger,
    verifier,
    fetchImpl: upstream.fetchImpl
  });

  await new Promise<void>(resolve => {
    server = app.listen(0, '127.0.0.1', () => resolve());
  });
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

function rpc(body: unknown, token?: string): Promise<Response> {
  return fetch(`${baseUrl}/mcp`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json, text/event-stream',
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  });
}

const initialize = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'test-host', version: '1.0.0' }
  }
};

describe('inbound authentication (acceptance 4 and 5)', () => {
  it('answers an unauthenticated request with 401 and a resource_metadata pointer', async () => {
    const response = await rpc(initialize);

    expect(response.status).toBe(401);
    const challenge = response.headers.get('www-authenticate') ?? '';
    expect(challenge).toMatch(/^Bearer /);
    expect(challenge).toContain('error="invalid_token"');
    expect(challenge).toContain(
      `resource_metadata="https://mcp.test.local/.well-known/oauth-protected-resource/mcp"`
    );
  });

  it('answers a malformed Authorization header with 401', async () => {
    const response = await fetch(`${baseUrl}/mcp`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: 'Basic abc' },
      body: JSON.stringify(initialize)
    });
    expect(response.status).toBe(401);
    expect(response.headers.get('www-authenticate')).toContain('invalid_token');
  });

  it('answers a token with broader scope with 403 insufficient_scope', async () => {
    const response = await rpc(initialize, 'wide-token');

    expect(response.status).toBe(403);
    const challenge = response.headers.get('www-authenticate') ?? '';
    expect(challenge).toContain('error="insufficient_scope"');
    expect(challenge).toContain('scope="docs:read"');
    expect(challenge).toContain('resource_metadata=');
  });

  it('serves a verified caller', async () => {
    const response = await rpc(initialize, 'read-token');
    expect(response.status).toBe(200);
    const body = (await response.json()) as { result?: { serverInfo?: { name: string } } };
    expect(body.result?.serverInfo?.name).toBe('document-readonly');
  });

  it('forwards the caller token upstream rather than a service account token', async () => {
    await rpc(initialize, 'read-token');
    const call = await rpc(
      {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'list_render_jobs', arguments: {} }
      },
      'read-token'
    );

    expect(call.status).toBe(200);
    expect(upstream.requests.at(-1)?.authorization).toBe('Bearer read-token');
  });
});

describe('protected resource metadata (acceptance 6)', () => {
  it('resolves at the path-suffixed well-known location', async () => {
    const response = await fetch(`${baseUrl}/.well-known/oauth-protected-resource/mcp`);
    expect(response.status).toBe(200);

    const document = (await response.json()) as Record<string, unknown>;
    expect(document.resource).toBe(RESOURCE_URL);
    expect(document.authorization_servers).toEqual(['https://auth.test.local/realms/docs']);
    expect(document.scopes_supported).toEqual(['docs:read']);
  });

  it('resolves at the bare well-known location too', async () => {
    const response = await fetch(`${baseUrl}/.well-known/oauth-protected-resource`);
    expect(response.status).toBe(200);
    expect(((await response.json()) as { resource: string }).resource).toBe(RESOURCE_URL);
  });

  it('echoes the configured URL verbatim, path included', () => {
    for (const url of [
      'https://mcp.example.com/mcp',
      'https://mcp.example.com/connectors/docs/mcp',
      'https://mcp.example.com'
    ]) {
      expect(
        buildProtectedResourceMetadata({ resourceUrl: url, issuerUrl: 'https://auth/realms/docs' })
          .resource
      ).toBe(url);
    }
  });

  it('advertises a metadata URL that carries the resource path', () => {
    expect(protectedResourceMetadataUrl('https://mcp.example.com/connectors/docs/mcp')).toBe(
      'https://mcp.example.com/.well-known/oauth-protected-resource/connectors/docs/mcp'
    );
    expect(protectedResourceMetadataUrl('https://mcp.example.com')).toBe(
      'https://mcp.example.com/.well-known/oauth-protected-resource'
    );
  });

  it('publishes no authorization server endpoints — this is a resource server', async () => {
    for (const path of [
      '/.well-known/oauth-authorization-server',
      '/authorize',
      '/token',
      '/register'
    ]) {
      expect((await fetch(`${baseUrl}${path}`)).status).toBe(404);
    }
  });
});

describe('statelessness', () => {
  it('refuses non-POST methods on the MCP endpoint', async () => {
    const response = await fetch(`${baseUrl}/mcp`, {
      headers: { authorization: 'Bearer read-token' }
    });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST');
  });

  it('serves a second request with no session header at all', async () => {
    const first = await rpc(initialize, 'read-token');
    const second = await rpc(initialize, 'read-token');
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.headers.get('mcp-session-id')).toBeNull();
  });

  it('serves its own liveness probe without calling the document API', async () => {
    const before = upstream.requests.length;
    const response = await fetch(`${baseUrl}/healthz`);
    expect(response.status).toBe(200);
    expect(upstream.requests.length).toBe(before);
  });
});
