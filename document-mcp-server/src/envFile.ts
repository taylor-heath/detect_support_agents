/**
 * Loading a local .env file.
 *
 * The server itself reads `process.env` and nothing else — that stays true, and
 * in production these values are injected by the platform or a secrets manager.
 * This module exists only so a *local* run picks up a `.env` sitting next to the
 * package, whatever directory it was launched from.
 *
 * It deliberately does not depend on dotenv, and it deliberately does not
 * override variables that are already set: a real environment variable always
 * wins over a file on disk, so a deployed process cannot be re-pointed by a
 * stray `.env` left in the image.
 *
 * Called from the two entry points only. Embedding the server as a library gets
 * no surprise environment mutation.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface LoadEnvFileResult {
  /** The file that was read, or undefined when none was found. */
  path?: string;
  /** Variables taken from the file (those not already in the environment). */
  applied: string[];
  /** Names present in the file but left alone because the environment had them. */
  skipped: string[];
  /** Candidate paths that were examined, in order. */
  searched: string[];
}

/**
 * Parses .env content the way Node's own `--env-file` does: `KEY=VALUE` per
 * line, `#` comments on their own line, optional surrounding quotes. Inline
 * comments are *not* stripped — a `#` inside a value is part of the value, so a
 * URL fragment or a secret containing one survives.
 */
export function parseEnvFile(contents: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const rawLine of contents.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).replace(/^export\s+/, '').trim();
    if (key === '') continue;

    let value = line.slice(separator + 1).trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'" || quote === '`') && value.endsWith(quote) && value.length > 1) {
      value = value.slice(1, -1);
      if (quote === '"') value = value.replace(/\\n/g, '\n');
    }

    parsed[key] = value;
  }

  return parsed;
}

/**
 * Where to look, in order:
 *   1. `DOCS_MCP_ENV_FILE`, when set — an explicit path always wins.
 *   2. `.env` in the current working directory.
 *   3. `.env` beside the package root, found by walking up from this module.
 *
 * (3) is what makes `node /opt/document-mcp-server/dist/bin/http.js` work from
 * any directory, which is how process managers and MCP hosts launch it.
 */
function candidatePaths(env: NodeJS.ProcessEnv, moduleDir: string, cwd: string): string[] {
  const candidates: string[] = [];

  const explicit = env.DOCS_MCP_ENV_FILE?.trim();
  if (explicit) candidates.push(path.resolve(explicit));

  candidates.push(path.resolve(cwd, '.env'));

  let dir = moduleDir;
  for (let depth = 0; depth < 5; depth += 1) {
    if (existsSync(path.join(dir, 'package.json'))) {
      candidates.push(path.join(dir, '.env'));
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return [...new Set(candidates)];
}

export function loadEnvFile(
  env: NodeJS.ProcessEnv = process.env,
  moduleDir: string = path.dirname(fileURLToPath(import.meta.url)),
  cwd: string = process.cwd()
): LoadEnvFileResult {
  const searched = candidatePaths(env, moduleDir, cwd);
  const found = searched.find(candidate => existsSync(candidate));

  if (!found) return { applied: [], skipped: [], searched };

  const parsed = parseEnvFile(readFileSync(found, 'utf8'));
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const [key, value] of Object.entries(parsed)) {
    if (env[key] !== undefined && env[key] !== '') {
      skipped.push(key);
      continue;
    }
    env[key] = value;
    applied.push(key);
  }

  return { path: found, applied, skipped, searched };
}
