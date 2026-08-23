/**
 * Acceptance criterion 3, verified from the other side: the CI guard must
 * actually fail when someone adds a write path. A guard nobody has seen fail is
 * a guard nobody knows works.
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function runGuard(): { code: number; output: string } {
  try {
    const output = execFileSync(process.execPath, [path.join(root, 'scripts', 'check-readonly.mjs')], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    return { code: 0, output };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };
    return { code: failure.status ?? 1, output: `${failure.stdout ?? ''}${failure.stderr ?? ''}` };
  }
}

function withTempSource(relativePath: string, contents: string, assertion: (result: ReturnType<typeof runGuard>) => void): void {
  const full = path.join(root, relativePath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, contents);
  try {
    assertion(runGuard());
  } finally {
    rmSync(full, { force: true });
  }
}

describe('the read-only guard', () => {
  it('passes on the shipped source', () => {
    const result = runGuard();
    expect(result.code).toBe(0);
    expect(result.output).toContain('read-only check passed');
  });

  it('fails when a non-GET method appears in the outbound client', () => {
    withTempSource(
      path.join('src', 'upstream', 'tempViolation.ts'),
      `export async function submit(): Promise<void> {\n  await fetch('https://api.example.com/v1/jobs', { method: 'POST' });\n}\n`,
      result => {
        expect(result.code).not.toBe(0);
        expect(result.output).toContain('read-only check FAILED');
        expect(result.output).toMatch(/HTTP method POST appears in the outbound Document API client/);
      }
    );
  });

  it('fails when a non-GET request is built anywhere outside the token endpoint', () => {
    withTempSource(
      path.join('src', 'tools', 'tempViolation.ts'),
      `export const options = { method: 'DELETE' };\n`,
      result => {
        expect(result.code).not.toBe(0);
        expect(result.output).toMatch(/non-GET request method "DELETE"/);
      }
    );
  });

  it('fails when a tool is registered outside the single registration site', () => {
    withTempSource(
      path.join('src', 'tools', 'tempRogueTool.ts'),
      `import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';\n` +
        `export function add(server: McpServer): void {\n  server.registerTool('create_job', {}, async () => ({ content: [] }));\n}\n`,
      result => {
        expect(result.code).not.toBe(0);
        expect(result.output).toMatch(/tools may only be registered in/);
      }
    );
  });

  it('fails when something other than the two clients calls fetch directly', () => {
    withTempSource(
      path.join('src', 'shaping', 'tempViolation.ts'),
      `export async function peek(): Promise<Response> {\n  return fetch('https://api.example.com/v1/templates');\n}\n`,
      result => {
        expect(result.code).not.toBe(0);
        expect(result.output).toMatch(/direct fetch\(\) call outside/);
      }
    );
  });
});
