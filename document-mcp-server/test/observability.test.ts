import { afterEach, describe, expect, it, vi } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createDocumentMcpServer } from '../src/server.js';
import { createLogger } from '../src/logging.js';
import { loadConfig, ConfigError } from '../src/config.js';
import { createFakeUpstream, job, json, testConfig } from './helpers/fakeUpstream.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('logging (contract §8)', () => {
  it('writes one structured line per tool call, without argument values or tokens', async () => {
    const lines: string[] = [];
    vi.spyOn(process.stderr, 'write').mockImplementation((chunk: unknown) => {
      lines.push(String(chunk));
      return true;
    });

    const upstream = createFakeUpstream();
    upstream.route('/jobs', () => json({ items: [job(1)], nextCursor: null }));

    const server = createDocumentMcpServer({
      config: testConfig(),
      logger: createLogger('info'),
      getToken: async () => 'super-secret-token',
      fetchImpl: upstream.fetchImpl
    });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test-host', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    await client.callTool({
      name: 'list_render_jobs',
      arguments: { status: 'failed', cursor: 'cursor-value-must-not-be-logged' }
    });

    const toolCalls = lines
      .join('')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as Record<string, unknown>)
      .filter(entry => entry.event === 'tool_call');

    expect(toolCalls).toHaveLength(1);
    expect(toolCalls[0]).toMatchObject({
      tool: 'list_render_jobs',
      upstreamStatus: 200,
      outcome: 'ok'
    });
    expect(typeof toolCalls[0]!.durationMs).toBe('number');

    const everything = lines.join('');
    expect(everything).not.toContain('super-secret-token');
    expect(everything).not.toContain('cursor-value-must-not-be-logged');
  });

  it('goes to stderr, never stdout, so stdio framing stays intact', () => {
    const stdout = vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

    createLogger('info').info('server_started', { transport: 'stdio' });

    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledOnce();
  });
});

describe('configuration (contract §8, no secrets in source)', () => {
  const base = {
    DOCS_API_BASE_URL: 'https://api.example.com/v1',
    DOCS_MCP_ISSUER_URL: 'https://auth.example.com/realms/docs'
  };

  it('derives the JWKS and token endpoints from the issuer', () => {
    const config = loadConfig('http', {
      ...base,
      DOCS_MCP_RESOURCE_URL: 'https://mcp.example.com/mcp'
    } as NodeJS.ProcessEnv);

    expect(config.inboundAuth.jwksUri).toBe(
      'https://auth.example.com/realms/docs/protocol/openid-connect/certs'
    );
    expect(config.outboundAuth.tokenEndpoint).toBe(
      'https://auth.example.com/realms/docs/protocol/openid-connect/token'
    );
    expect(config.outboundAuth.mode).toBe('forward');
  });

  it('requires the resource URL under HTTP, since the metadata document must match it', () => {
    expect(() => loadConfig('http', base as NodeJS.ProcessEnv)).toThrow(ConfigError);
  });

  it('requires local client credentials under stdio, where no caller token exists', () => {
    expect(() => loadConfig('stdio', base as NodeJS.ProcessEnv)).toThrow(/DOCS_MCP_CLIENT_ID/);

    const config = loadConfig('stdio', {
      ...base,
      DOCS_MCP_CLIENT_ID: 'docs-mcp-local'
    } as NodeJS.ProcessEnv);
    expect(config.outboundAuth.clientId).toBe('docs-mcp-local');
  });

  it('requires an API audience when exchanging tokens', () => {
    expect(() =>
      loadConfig('http', {
        ...base,
        DOCS_MCP_RESOURCE_URL: 'https://mcp.example.com/mcp',
        DOCS_MCP_OUTBOUND_TOKEN_MODE: 'exchange',
        DOCS_MCP_CLIENT_ID: 'docs-mcp'
      } as NodeJS.ProcessEnv)
    ).toThrow(/DOCS_API_AUDIENCE/);
  });

  it('rejects an unknown outbound token mode rather than guessing', () => {
    expect(() =>
      loadConfig('http', {
        ...base,
        DOCS_MCP_RESOURCE_URL: 'https://mcp.example.com/mcp',
        DOCS_MCP_OUTBOUND_TOKEN_MODE: 'service-account'
      } as NodeJS.ProcessEnv)
    ).toThrow(ConfigError);
  });
});

describe('adapter overhead (contract §8)', () => {
  it('adds well under 50 ms at p95, excluding the upstream call', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs', () =>
      json({ items: Array.from({ length: 20 }, (_, index) => job(index)), nextCursor: null })
    );

    const server = createDocumentMcpServer({
      config: testConfig(),
      logger: createLogger('error'),
      getToken: async () => 'test-token',
      fetchImpl: upstream.fetchImpl
    });

    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: 'test-host', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    const samples: number[] = [];
    for (let index = 0; index < 50; index += 1) {
      const startedAt = performance.now();
      await client.callTool({ name: 'list_render_jobs', arguments: {} });
      samples.push(performance.now() - startedAt);
    }

    samples.sort((a, b) => a - b);
    const p95 = samples[Math.floor(samples.length * 0.95)]!;
    expect(p95).toBeLessThan(50);
  });
});
