#!/usr/bin/env node
import { loadEnvFile } from '../envFile.js';
import { runStdio } from '../transports/stdio.js';

// Before config is read, so a local .env is picked up whatever directory the
// host launched this from. Real environment variables still win.
const envFile = loadEnvFile();

// stdout carries JSON-RPC framing; diagnostics go to stderr only.
function log(fields: Record<string, unknown>): void {
  process.stderr.write(`${JSON.stringify({ ts: new Date().toISOString(), ...fields })}\n`);
}

log(
  envFile.path
    ? { level: 'info', event: 'env_file_loaded', file: envFile.path, applied: envFile.applied.length, overriddenByEnvironment: envFile.skipped.length }
    : { level: 'debug', event: 'env_file_absent', searched: envFile.searched }
);

runStdio().catch((error: unknown) => {
  log({
    level: 'error',
    event: 'startup_failed',
    transport: 'stdio',
    reason: error instanceof Error ? error.message : 'unknown',
    envFile: envFile.path ?? null,
    searched: envFile.path ? undefined : envFile.searched
  });
  process.exit(1);
});
