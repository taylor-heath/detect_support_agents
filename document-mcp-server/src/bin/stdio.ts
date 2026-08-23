#!/usr/bin/env node
import { runStdio } from '../transports/stdio.js';

runStdio().catch((error: unknown) => {
  process.stderr.write(
    `${JSON.stringify({
      level: 'error',
      event: 'startup_failed',
      transport: 'stdio',
      reason: error instanceof Error ? error.message : 'unknown'
    })}\n`
  );
  process.exit(1);
});
