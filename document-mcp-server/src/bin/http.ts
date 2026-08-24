#!/usr/bin/env node
import { loadEnvFile } from '../envFile.js';
import { runHttp } from '../transports/http.js';

// Before config is read, so a local .env is picked up whatever directory the
// process was launched from. Real environment variables still win.
const envFile = loadEnvFile();

function log(fields: Record<string, unknown>): void {
  process.stderr.write(`${JSON.stringify({ ts: new Date().toISOString(), ...fields })}\n`);
}

log(
  envFile.path
    ? { level: 'info', event: 'env_file_loaded', file: envFile.path, applied: envFile.applied.length, overriddenByEnvironment: envFile.skipped.length }
    : { level: 'debug', event: 'env_file_absent', searched: envFile.searched }
);

runHttp().catch((error: unknown) => {
  log({
    level: 'error',
    event: 'startup_failed',
    transport: 'streamable-http',
    reason: error instanceof Error ? error.message : 'unknown',
    // Naming the paths turns "but I made a .env" into a one-line diagnosis.
    envFile: envFile.path ?? null,
    searched: envFile.path ? undefined : envFile.searched
  });
  process.exit(1);
});
