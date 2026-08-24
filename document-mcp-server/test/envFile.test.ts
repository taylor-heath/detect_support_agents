/**
 * The .env loader. These exist because a missing variable with a file plainly
 * sitting on disk is a miserable thing to debug.
 */

import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { loadEnvFile, parseEnvFile } from '../src/envFile.js';

const SAMPLE = `# a comment
DOCS_API_BASE_URL=https://api.example.com/v1

# ── a box-drawing heading, as in env.example ────────────────────────────────
DOCS_MCP_ISSUER_URL=https://lotschberg-dev-gateway.incubation.adaptivespace.ios
# DOCS_MCP_JWKS_URI       — a commented hint with an em dash
QUOTED="quoted value"
SINGLE='single value'
export EXPORTED=exported
WITH_HASH=https://example.com/path#fragment
`;

describe('parsing', () => {
  it('reads keys around comments, blank lines and box-drawing headings', () => {
    const parsed = parseEnvFile(SAMPLE);
    expect(parsed.DOCS_MCP_ISSUER_URL).toBe(
      'https://lotschberg-dev-gateway.incubation.adaptivespace.ios'
    );
    expect(parsed.DOCS_API_BASE_URL).toBe('https://api.example.com/v1');
    expect(parsed.DOCS_MCP_JWKS_URI).toBeUndefined();
  });

  it('strips surrounding quotes and an export prefix', () => {
    const parsed = parseEnvFile(SAMPLE);
    expect(parsed.QUOTED).toBe('quoted value');
    expect(parsed.SINGLE).toBe('single value');
    expect(parsed.EXPORTED).toBe('exported');
  });

  it('keeps a # inside a value, since it may be a fragment or a secret', () => {
    expect(parseEnvFile(SAMPLE).WITH_HASH).toBe('https://example.com/path#fragment');
  });

  it('handles CRLF line endings and a UTF-8 BOM', () => {
    const crlf = parseEnvFile(SAMPLE.replace(/\n/g, '\r\n'));
    expect(crlf.DOCS_API_BASE_URL).toBe('https://api.example.com/v1');

    const bom = parseEnvFile(`﻿DOCS_API_BASE_URL=https://api.example.com/v1\n`);
    expect(bom.DOCS_API_BASE_URL).toBe('https://api.example.com/v1');
  });
});

describe('discovery', () => {
  function fixture(): { dir: string; packageDir: string } {
    const dir = mkdtempSync(path.join(tmpdir(), 'envfile-'));
    const packageDir = path.join(dir, 'package');
    mkdirSync(path.join(packageDir, 'dist', 'bin'), { recursive: true });
    writeFileSync(path.join(packageDir, 'package.json'), '{}');
    return { dir, packageDir };
  }

  it('finds a .env beside the package root, whatever the working directory', () => {
    const { dir, packageDir } = fixture();
    writeFileSync(path.join(packageDir, '.env'), 'DOCS_MCP_ISSUER_URL=https://issuer.test\n');

    const env: NodeJS.ProcessEnv = {};
    const result = loadEnvFile(env, path.join(packageDir, 'dist', 'bin'), dir);

    expect(result.path).toBe(path.join(packageDir, '.env'));
    expect(env.DOCS_MCP_ISSUER_URL).toBe('https://issuer.test');
  });

  it('prefers an explicit DOCS_MCP_ENV_FILE over anything found by walking up', () => {
    const { dir, packageDir } = fixture();
    writeFileSync(path.join(packageDir, '.env'), 'DOCS_MCP_ISSUER_URL=https://beside-package.test\n');
    const explicitPath = path.join(dir, 'explicit.env');
    writeFileSync(explicitPath, 'DOCS_MCP_ISSUER_URL=https://explicit.test\n');

    const env: NodeJS.ProcessEnv = { DOCS_MCP_ENV_FILE: explicitPath };
    const result = loadEnvFile(env, path.join(packageDir, 'dist', 'bin'), dir);

    expect(result.path).toBe(explicitPath);
    expect(env.DOCS_MCP_ISSUER_URL).toBe('https://explicit.test');
  });

  it('lets a real environment variable win over the file', () => {
    const { dir, packageDir } = fixture();
    writeFileSync(path.join(packageDir, '.env'), 'DOCS_MCP_ISSUER_URL=https://from-file.test\n');

    const env: NodeJS.ProcessEnv = { DOCS_MCP_ISSUER_URL: 'https://from-environment.test' };
    const result = loadEnvFile(env, path.join(packageDir, 'dist', 'bin'), dir);

    expect(env.DOCS_MCP_ISSUER_URL).toBe('https://from-environment.test');
    expect(result.skipped).toContain('DOCS_MCP_ISSUER_URL');
    expect(result.applied).not.toContain('DOCS_MCP_ISSUER_URL');
  });

  it('reports the paths it searched when there is no file to read', () => {
    const { dir, packageDir } = fixture();

    const result = loadEnvFile({}, path.join(packageDir, 'dist', 'bin'), dir);

    expect(result.path).toBeUndefined();
    expect(result.applied).toEqual([]);
    expect(result.searched).toContain(path.join(packageDir, '.env'));
  });
});
