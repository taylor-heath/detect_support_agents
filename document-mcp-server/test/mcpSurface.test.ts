/**
 * Acceptance criteria 2, 8 and 10: all six tools are listed and callable by an
 * MCP client, the same server runs under stdio with no change beyond transport
 * selection, and no tool returns binary content.
 */

import { describe, expect, it } from 'vitest';
import { PassThrough } from 'node:stream';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { createDocumentMcpServer } from '../src/server.js';
import { silentLogger } from '../src/logging.js';
import { READ_ONLY_ANNOTATIONS } from '../src/tools/index.js';
import { createFakeUpstream, job, json, testConfig } from './helpers/fakeUpstream.js';

const EXPECTED_TOOLS = [
  'list_templates',
  'get_template',
  'get_payload_schema',
  'list_render_jobs',
  'get_render_job',
  'get_artifact_link'
];

async function connectedClient(): Promise<{
  client: Client;
  upstream: ReturnType<typeof createFakeUpstream>;
}> {
  const upstream = createFakeUpstream();
  const server = createDocumentMcpServer({
    config: testConfig(),
    logger: silentLogger,
    getToken: async () => 'test-token',
    fetchImpl: upstream.fetchImpl
  });

  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test-host', version: '1.0.0' });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return { client, upstream };
}

describe('the tool surface an MCP host sees', () => {
  it('lists exactly the six contracted tools', async () => {
    const { client } = await connectedClient();
    const { tools } = await client.listTools();
    expect(tools.map(tool => tool.name).sort()).toEqual([...EXPECTED_TOOLS].sort());
  });

  it('declares the contracted annotations on every tool (contract §4.1)', async () => {
    const { client } = await connectedClient();
    const { tools } = await client.listTools();

    for (const tool of tools) {
      expect(tool.annotations).toMatchObject(READ_ONLY_ANNOTATIONS);
    }
  });

  it('describes what each tool returns without restating its arguments', async () => {
    const { client } = await connectedClient();
    const { tools } = await client.listTools();

    for (const tool of tools) {
      expect(tool.description!.length).toBeGreaterThan(80);
      expect(tool.description!).toMatch(/^Returns /);
    }
  });

  it('advertises no prompts or resources — this is a tool surface only', async () => {
    const { client } = await connectedClient();
    await expect(client.listResources()).rejects.toThrow();
    await expect(client.listPrompts()).rejects.toThrow();
  });
});

describe('calling every tool end to end', () => {
  it('returns text content and nothing binary (acceptance 10)', async () => {
    const { client, upstream } = await connectedClient();

    upstream.route('/templates/corp-16x9', () =>
      json({ id: 'corp-16x9', name: 'Corporate 16:9', target: 'pptx', schemaId: 'pptx/v1' })
    );
    upstream.route('/schemas/pptx/v1', () => json({ type: 'object' }));
    upstream.route('/jobs', () => json({ items: [job(1)], nextCursor: null }));
    upstream.route('/jobs/00000000-0000-4000-8000-000000000001', () => json(job(1)));
    upstream.route('/jobs/00000000-0000-4000-8000-000000000001/artifacts', () =>
      json({
        items: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            jobId: '00000000-0000-4000-8000-000000000001',
            filename: 'q3-review.pptx',
            mediaType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            sizeBytes: 4096
          }
        ]
      })
    );
    upstream.route('/artifacts/11111111-1111-4111-8111-111111111111/download-url', () =>
      json({ url: 'https://files.test.local/x', expiresAt: '2026-08-23T18:00:00Z' })
    );

    const calls: Array<[string, Record<string, unknown>]> = [
      ['list_templates', {}],
      ['get_template', { templateId: 'corp-16x9' }],
      ['get_payload_schema', { schemaId: 'pptx/v1' }],
      ['list_render_jobs', { status: 'succeeded' }],
      ['get_render_job', { jobId: '00000000-0000-4000-8000-000000000001' }],
      ['get_artifact_link', { artifactId: '11111111-1111-4111-8111-111111111111' }]
    ];

    for (const [name, args] of calls) {
      const result = await client.callTool({ name, arguments: args });
      const content = result.content as Array<{ type: string }>;
      expect(content.length).toBeGreaterThan(0);
      expect(content.every(part => part.type === 'text')).toBe(true);
      expect(result.isError ?? false).toBe(false);
    }

    // Every upstream call the six tools made was a GET.
    expect(upstream.requests.every(request => request.method === 'GET')).toBe(true);
  });

  it('rejects malformed identifiers before any HTTP call (contract §4.3)', async () => {
    const { client, upstream } = await connectedClient();

    const result = await client.callTool({
      name: 'get_template',
      arguments: { templateId: 'Not A Valid Id!' }
    });

    expect(result.isError).toBe(true);
    expect(upstream.requests).toHaveLength(0);
  });

  it('rejects an out-of-enum target and an unknown job id shape', async () => {
    const { client, upstream } = await connectedClient();

    expect((await client.callTool({ name: 'list_templates', arguments: { target: 'pdf' } })).isError).toBe(true);
    expect((await client.callTool({ name: 'get_render_job', arguments: { jobId: '42' } })).isError).toBe(true);
    expect(upstream.requests).toHaveLength(0);
  });

  it('reports an upstream 404 as a readable tool error, not a protocol failure', async () => {
    const { client } = await connectedClient();

    const result = await client.callTool({
      name: 'get_render_job',
      arguments: { jobId: '00000000-0000-4000-8000-000000000404' }
    });

    expect(result.isError).toBe(true);
    expect((result.content as Array<{ text: string }>)[0]!.text).toContain('No such render job');
  });
});

describe('the same server under stdio (acceptance 8)', () => {
  it('completes initialize and lists the same six tools', async () => {
    const upstream = createFakeUpstream();
    const server = createDocumentMcpServer({
      config: testConfig(),
      logger: silentLogger,
      getToken: async () => 'test-token',
      fetchImpl: upstream.fetchImpl
    });

    // Same factory, same registration; only the transport differs.
    const toServer = new PassThrough();
    const toClient = new PassThrough();
    await server.connect(new StdioServerTransport(toServer, toClient));

    const client = new Client({ name: 'stdio-host', version: '1.0.0' });
    const transport = new StdioClientTransport({ command: 'true' });
    // Drive the framing directly rather than spawning a process: the point is
    // that the McpServer needs no change, not that Node can spawn.
    Object.assign(transport, { _stdin: toServer, _stdout: toClient });

    const framed: string[] = [];
    toClient.on('data', chunk => framed.push(String(chunk)));

    const request = {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-06-18',
        capabilities: {},
        clientInfo: { name: 'stdio-host', version: '1.0.0' }
      }
    };
    toServer.write(`${JSON.stringify(request)}\n`);
    toServer.write(`${JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' })}\n`);
    await new Promise(resolve => setTimeout(resolve, 50));
    toServer.write(`${JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' })}\n`);
    await new Promise(resolve => setTimeout(resolve, 50));

    const messages = framed
      .join('')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line) as { id?: number; result?: { tools?: Array<{ name: string }> } });

    const listed = messages.find(message => message.id === 2)?.result?.tools ?? [];
    expect(listed.map(tool => tool.name).sort()).toEqual([...EXPECTED_TOOLS].sort());
    await client.close().catch(() => {});
  });
});
