import { describe, expect, it, vi } from 'vitest';
import { createReadOnlyClient } from '../src/upstream/client.js';
import { UpstreamError, UpstreamTransportError } from '../src/upstream/errors.js';
import { silentLogger } from '../src/logging.js';
import { BASE_URL, json, problem } from './helpers/fakeUpstream.js';

function client(fetchImpl: typeof fetch, extra: Record<string, unknown> = {}) {
  return createReadOnlyClient({
    baseUrl: BASE_URL,
    getToken: async () => 'test-token',
    logger: silentLogger,
    fetchImpl,
    sleep: async () => {},
    jitter: () => 0,
    ...extra
  });
}

describe('the outbound client is read-only by construction', () => {
  it('exposes exactly one operation', () => {
    const instance = client((async () => json({})) as unknown as typeof fetch);
    expect(Object.keys(instance)).toEqual(['get']);
    expect(Object.isFrozen(instance)).toBe(true);
  });

  it('issues GET and nothing else', async () => {
    const seen: string[] = [];
    const fetchImpl = (async (request: Request) => {
      seen.push(request.method);
      return json({ ok: true });
    }) as unknown as typeof fetch;

    await client(fetchImpl).get('/templates');
    expect(seen).toEqual(['GET']);
  });

  it('cannot be extended with another verb after construction', () => {
    const instance = client((async () => json({})) as unknown as typeof fetch) as Record<string, unknown>;
    expect(() => {
      'use strict';
      instance.post = () => undefined;
    }).toThrow();
    expect(instance.post).toBeUndefined();
  });
});

describe('request building', () => {
  it('drops empty query parameters and forwards the bearer token', async () => {
    let captured: Request | undefined;
    const fetchImpl = (async (request: Request) => {
      captured = request;
      return json({ items: [] });
    }) as unknown as typeof fetch;

    await client(fetchImpl).get('/jobs', {
      params: { status: 'failed', target: undefined, cursor: '', limit: 20 }
    });

    const url = new URL(captured!.url);
    expect(url.pathname).toBe('/v1/jobs');
    expect(Object.fromEntries(url.searchParams)).toEqual({ status: 'failed', limit: '20' });
    expect(captured!.headers.get('authorization')).toBe('Bearer test-token');
  });

  it('honours a custom Accept header', async () => {
    let accept: string | null = null;
    const fetchImpl = (async (request: Request) => {
      accept = request.headers.get('accept');
      return json({});
    }) as unknown as typeof fetch;

    await client(fetchImpl).get('/schemas/pptx/v1', { accept: 'application/schema+json' });
    expect(accept).toBe('application/schema+json');
  });
});

describe('retries, per contract §7', () => {
  it('retries a 429 once when Retry-After is under 5s', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(problem(429, { title: 'Too Many Requests' }, { 'retry-after': '2' }))
      .mockResolvedValueOnce(json({ items: [] })) as unknown as typeof fetch;

    const result = await client(fetchImpl).get('/jobs');
    expect(result.status).toBe(200);
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });

  it('does not retry a 429 whose Retry-After exceeds 5s', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(problem(429, { title: 'Too Many Requests' }, { 'retry-after': '30' })) as unknown as typeof fetch;

    await expect(client(fetchImpl).get('/jobs')).rejects.toBeInstanceOf(UpstreamError);
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1);
  });

  it('retries a 5xx exactly once, then reports it', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(problem(503, { title: 'Service Unavailable', detail: 'renderer down' })) as unknown as typeof fetch;

    const error = await client(fetchImpl)
      .get('/jobs')
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(UpstreamError);
    expect((error as UpstreamError).status).toBe(503);
    expect((fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });
});

describe('failures', () => {
  it('surfaces the problem detail on a 400', async () => {
    const fetchImpl = (async () =>
      problem(400, {
        title: 'Bad Request',
        status: 400,
        detail: 'cursor is not valid',
        errors: [{ pointer: '/cursor', message: 'expired' }]
      })) as unknown as typeof fetch;

    const error = (await client(fetchImpl)
      .get('/jobs')
      .catch((caught: unknown) => caught)) as UpstreamError;

    expect(error.status).toBe(400);
    expect(error.message).toBe('cursor is not valid');
    expect(error.problem?.errors?.[0]?.pointer).toBe('/cursor');
  });

  it('reports a network failure as a transport error', async () => {
    const fetchImpl = (async () => {
      throw new Error('ECONNRESET');
    }) as unknown as typeof fetch;

    await expect(client(fetchImpl).get('/jobs')).rejects.toBeInstanceOf(UpstreamTransportError);
  });
});
