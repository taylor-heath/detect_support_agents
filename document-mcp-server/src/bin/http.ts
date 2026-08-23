#!/usr/bin/env node
import { runHttp } from '../transports/http.js';

runHttp().catch((error: unknown) => {
  process.stderr.write(
    `${JSON.stringify({
      level: 'error',
      event: 'startup_failed',
      transport: 'streamable-http',
      reason: error instanceof Error ? error.message : 'unknown'
    })}\n`
  );
  process.exit(1);
});
