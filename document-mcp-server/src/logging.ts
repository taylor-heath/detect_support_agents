/**
 * Structured logging — contract §8.
 *
 * One line per tool call carrying tool name, caller subject, upstream status
 * and duration. Argument values and tokens are never accepted by this module's
 * API, so there is no path by which they can be logged.
 *
 * Everything goes to stderr: stdout belongs to the stdio transport's JSON-RPC
 * framing and a stray log line there corrupts the session.
 */

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 } as const;

export type LogLevel = keyof typeof LEVELS;

export interface ToolCallLog {
  tool: string;
  /** Caller subject, or `local` under stdio where no inbound token exists. */
  subject: string;
  /** Upstream HTTP status, or null when no upstream call was made. */
  upstreamStatus: number | null;
  durationMs: number;
  outcome: 'ok' | 'error';
  /** Short, non-sensitive reason — never an argument value. */
  reason?: string;
}

export interface Logger {
  toolCall(entry: ToolCallLog): void;
  info(event: string, fields?: Record<string, string | number | boolean | null>): void;
  warn(event: string, fields?: Record<string, string | number | boolean | null>): void;
  error(event: string, fields?: Record<string, string | number | boolean | null>): void;
  debug(event: string, fields?: Record<string, string | number | boolean | null>): void;
}

export function createLogger(level: LogLevel = 'info'): Logger {
  const threshold = LEVELS[level] ?? LEVELS.info;

  const emit = (
    lvl: LogLevel,
    event: string,
    fields: Record<string, unknown> = {}
  ): void => {
    if (LEVELS[lvl] < threshold) return;
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level: lvl,
      event,
      ...fields
    });
    process.stderr.write(`${line}\n`);
  };

  return {
    toolCall(entry) {
      emit(entry.outcome === 'ok' ? 'info' : 'warn', 'tool_call', entry as unknown as Record<string, unknown>);
    },
    info: (event, fields) => emit('info', event, fields),
    warn: (event, fields) => emit('warn', event, fields),
    error: (event, fields) => emit('error', event, fields),
    debug: (event, fields) => emit('debug', event, fields)
  };
}

/** A logger that swallows everything — for tests. */
export const silentLogger: Logger = {
  toolCall: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  debug: () => {}
};
