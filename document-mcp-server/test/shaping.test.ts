import { describe, expect, it } from 'vitest';
import { createReadOnlyClient, type ReadOnlyHttpClient } from '../src/upstream/client.js';
import { silentLogger } from '../src/logging.js';
import { MAX_RESULT_BYTES } from '../src/constants.js';
import { utf8Bytes } from '../src/shaping/budget.js';
import * as handlers from '../src/tools/handlers.js';
import { BASE_URL, createFakeUpstream, job, json, template } from './helpers/fakeUpstream.js';

function clientFor(upstream: ReturnType<typeof createFakeUpstream>): ReadOnlyHttpClient {
  return createReadOnlyClient({
    baseUrl: BASE_URL,
    getToken: async () => 'test-token',
    logger: silentLogger,
    fetchImpl: upstream.fetchImpl,
    sleep: async () => {},
    jitter: () => 0
  });
}

function text(result: { content: Array<{ text: string }> }): string {
  return result.content.map(part => part.text).join('\n');
}

describe('list_render_jobs', () => {
  it('stays within the 25 KB ceiling and reports the omitted count (acceptance 9)', async () => {
    const upstream = createFakeUpstream();
    const jobs = Array.from({ length: 500 }, (_, index) => job(index));
    upstream.route('/jobs', () => json({ items: jobs, nextCursor: 'page-2' }));

    const result = await handlers.listRenderJobs(clientFor(upstream), { limit: 100 });
    const body = text(result);

    expect(utf8Bytes(body)).toBeLessThanOrEqual(MAX_RESULT_BYTES);
    expect(body).toMatch(/further jobs were omitted/);

    const omitted = Number(/(\d+) further jobs were omitted/.exec(body)![1]);
    const shown = (body.match(/"status":/g) ?? []).length;
    expect(omitted + shown).toBe(500);
  });

  it('states that more pages exist and hands over the cursor', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs', () => json({ items: [job(1)], nextCursor: 'eyJvIjoxMH0' }));

    const body = text(await handlers.listRenderJobs(clientFor(upstream), {}));
    expect(body).toContain('More results exist');
    expect(body).toContain('cursor="eyJvIjoxMH0"');
    expect(body).toContain('do not treat this page as complete');
  });

  it('says so plainly when the page is the last one', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs', () => json({ items: [job(1)], nextCursor: null }));

    expect(text(await handlers.listRenderJobs(clientFor(upstream), {}))).toContain(
      'This is the last page'
    );
  });

  it('clamps limit above 100 rather than rejecting it', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs', () => json({ items: [], nextCursor: null }));

    await handlers.listRenderJobs(clientFor(upstream), { limit: 5000 });
    expect(upstream.requests.at(-1)?.query.limit).toBe('100');
  });

  it('omits submittedBy from every job it returns', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs', () => json({ items: [job(1)], nextCursor: null }));

    expect(text(await handlers.listRenderJobs(clientFor(upstream), {}))).not.toContain(
      'user-should-not-be-returned'
    );
  });
});

describe('get_render_job', () => {
  const failedJob = {
    ...job(7, 'failed'),
    schemaId: 'pptx/v1',
    durationMs: 812,
    errors: [
      {
        code: 'schema_violation',
        message: 'bullets exceeds maxBullets',
        pointer: '/body/slides/3/bullets/7'
      }
    ]
  };

  it('never asks for the submitted payload', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs/*', () => json({ ...failedJob, payload: { secret: 'do not leak' } }));

    const body = text(await handlers.getRenderJob(clientFor(upstream), { jobId: failedJob.id as string }));

    expect(upstream.requests.at(-1)?.query.include).toBeUndefined();
    expect(body).not.toContain('do not leak');
    expect(body).toContain('The submitted payload is not available through these tools.');
  });

  it('preserves errors[].pointer verbatim', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs/*', () => json(failedJob));

    const body = text(await handlers.getRenderJob(clientFor(upstream), { jobId: failedJob.id as string }));
    expect(body).toContain('/body/slides/3/bullets/7');
    expect(body).toContain('JSON Pointer into the submitted payload');
  });

  it('drops artifact checksums and job submitters, keeping the artifact id', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs/*', () =>
      json({
        ...job(8),
        artifacts: [
          {
            id: '11111111-1111-4111-8111-111111111111',
            jobId: job(8).id,
            filename: 'q3-review.pptx',
            mediaType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            sizeBytes: 812_311,
            checksumSha256: 'a'.repeat(64)
          }
        ]
      })
    );

    const body = text(await handlers.getRenderJob(clientFor(upstream), { jobId: job(8).id as string }));
    expect(body).toContain('11111111-1111-4111-8111-111111111111');
    expect(body).toContain('q3-review.pptx');
    expect(body).not.toContain('a'.repeat(64));
    expect(body).not.toContain('user-should-not-be-returned');
  });

  it('keeps a job with hundreds of artifacts inside the ceiling', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/jobs/*', () =>
      json({
        ...job(9),
        artifacts: Array.from({ length: 400 }, (_, index) => ({
          id: `22222222-2222-4222-8222-${String(index).padStart(12, '0')}`,
          jobId: job(9).id,
          filename: `slide-deck-part-${index}.pptx`,
          mediaType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          sizeBytes: 1024 * index
        }))
      })
    );

    const body = text(await handlers.getRenderJob(clientFor(upstream), { jobId: job(9).id as string }));
    expect(utf8Bytes(body)).toBeLessThanOrEqual(MAX_RESULT_BYTES);
    expect(body).toMatch(/further artifacts were omitted/);
  });
});

describe('list_templates', () => {
  it('folds the payload schema list in, so no separate tool is needed', async () => {
    const upstream = createFakeUpstream();
    const body = text(await handlers.listTemplates(clientFor(upstream), {}));

    expect(body).toContain('corp-16x9');
    expect(body).toContain('payloadSchemas');
    expect(body).toContain('pptx/v1');
    expect(upstream.requests.map(request => request.path).sort()).toEqual(['/schemas', '/templates']);
  });

  it('passes the target filter to both calls', async () => {
    const upstream = createFakeUpstream();
    await handlers.listTemplates(clientFor(upstream), { target: 'docx' });
    expect(upstream.requests.every(request => request.query.target === 'docx')).toBe(true);
  });
});

describe('get_template', () => {
  it('surfaces layouts and styles as the authoritative value lists', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/templates/corp-16x9', () =>
      json({
        ...template('corp-16x9'),
        schemaId: 'pptx/v1',
        layouts: [{ id: 'title-bullets', slots: ['title', 'bullets', 'notes'], maxBullets: 6 }]
      })
    );

    const body = text(await handlers.getTemplate(clientFor(upstream), { templateId: 'corp-16x9' }));
    expect(body).toContain('title-bullets');
    expect(body).toContain('maxBullets');
    expect(body).toContain('only valid values');
  });
});

describe('get_artifact_link', () => {
  it('returns a signed URL and never bytes', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/artifacts/*', () =>
      json({
        url: 'https://files.test.local/signed/q3.pptx?sig=abc',
        expiresAt: '2026-08-23T18:00:00Z',
        mediaType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        sizeBytes: 812_311
      })
    );

    const result = await handlers.getArtifactLink(clientFor(upstream), {
      artifactId: '11111111-1111-4111-8111-111111111111'
    });

    expect(result.content.every(part => part.type === 'text')).toBe(true);
    expect(text(result)).toContain('https://files.test.local/signed/q3.pptx?sig=abc');
    expect(text(result)).toContain('never return file bytes');
  });
});

describe('get_payload_schema', () => {
  it('requests the schema media type and returns the document as-is', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/schemas/pptx/v1', () =>
      json({ $schema: 'https://json-schema.org/draft/2020-12/schema', type: 'object' })
    );

    const body = text(await handlers.getPayloadSchema(clientFor(upstream), { schemaId: 'pptx/v1' }));
    expect(upstream.requests.at(-1)?.accept).toBe('application/schema+json');
    expect(body).toContain('json-schema.org/draft/2020-12/schema');
  });

  it('refuses to return a partial schema when one exceeds the ceiling', async () => {
    const upstream = createFakeUpstream();
    upstream.route('/schemas/pptx/v1', () =>
      json({
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        $defs: Object.fromEntries(
          Array.from({ length: 400 }, (_, index) => [
            `definition${index}`,
            { type: 'string', description: 'x'.repeat(120) }
          ])
        )
      })
    );

    const result = await handlers.getPayloadSchema(clientFor(upstream), { schemaId: 'pptx/v1' });
    expect(result.isError).toBe(true);
    expect(text(result)).toContain('above the 25 KB tool result limit');
    expect(text(result)).toContain('$defs');
  });
});
