import { describe, expect, it } from 'vitest';
import { mapUpstreamFailure } from '../src/tools/results.js';
import { OutboundAuthError, UpstreamError, UpstreamTransportError } from '../src/upstream/errors.js';

const jobRef = { kind: 'render job', id: 'abc' } as const;

describe('API problem details map to tool results, not transport failures (contract §7)', () => {
  it('quotes detail and every pointer on a 400', () => {
    const result = mapUpstreamFailure(
      new UpstreamError(400, 'payload failed validation', {
        detail: 'payload failed validation',
        errors: [
          { pointer: '/body/slides/3/bullets/7', message: 'too many bullets' },
          { pointer: '/meta/title', message: 'required' }
        ]
      }),
      jobRef
    );

    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('payload failed validation');
    expect(result.content[0]!.text).toContain('/body/slides/3/bullets/7');
    expect(result.content[0]!.text).toContain('/meta/title');
  });

  it('tells the model to check the identifier on a 404', () => {
    const result = mapUpstreamFailure(new UpstreamError(404, 'Not Found'), jobRef);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('No such render job');
    expect(result.content[0]!.text).toContain('abc');
  });

  it('states that an artifact expired on a 410', () => {
    const result = mapUpstreamFailure(new UpstreamError(410, 'Gone'), {
      kind: 'artifact',
      id: 'a1'
    });
    expect(result.content[0]!.text).toContain('expired');
  });

  it('reports a long rate limit with the wait time', () => {
    const result = mapUpstreamFailure(
      new UpstreamError(429, 'Too Many Requests', undefined, 30_000),
      jobRef
    );
    expect(result.content[0]!.text).toContain('30 seconds');
  });

  it('says a retry was already attempted on a 5xx', () => {
    const result = mapUpstreamFailure(new UpstreamError(503, 'renderer down'), jobRef);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('One retry was already attempted');
  });

  it('reports an unreachable service without ending the exchange', () => {
    const result = mapUpstreamFailure(new UpstreamTransportError('timed out'), jobRef);
    expect(result.isError).toBe(true);
    expect(result.content[0]!.text).toContain('could not be reached');
  });

  it('raises 401 and 403 as auth faults rather than tool results', () => {
    expect(() => mapUpstreamFailure(new UpstreamError(401, 'nope'), jobRef)).toThrow(
      OutboundAuthError
    );
    expect(() => mapUpstreamFailure(new UpstreamError(403, 'nope'), jobRef)).toThrow(
      OutboundAuthError
    );
  });
});
