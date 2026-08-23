/**
 * The result-size ceiling — contract §5.
 *
 * A tool result must not exceed 25 KB of text. When it would, the item list is
 * truncated (never an individual record mid-structure) and the result states
 * how many items were dropped.
 */

import { MAX_RESULT_BYTES } from '../constants.js';

const encoder = new TextEncoder();

export function utf8Bytes(text: string): number {
  return encoder.encode(text).length;
}

export interface FitResult<T> {
  text: string;
  shown: T[];
  omitted: number;
  /** True when the ceiling forced items out of the result. */
  truncated: boolean;
}

/**
 * Renders the longest prefix of `items` whose rendered text fits the ceiling.
 *
 * `render` is called with the items to show and the number omitted so the
 * caller can word the omission notice itself — the notice is part of the text
 * being measured, so it cannot be appended afterwards without risking an
 * overrun.
 */
export function fitItems<T>(
  items: T[],
  render: (shown: T[], omitted: number) => string,
  maxBytes: number = MAX_RESULT_BYTES
): FitResult<T> {
  const full = render(items, 0);
  if (utf8Bytes(full) <= maxBytes) {
    return { text: full, shown: items, omitted: 0, truncated: false };
  }

  // Largest fitting prefix, by bisection: rendering is not free and a 500-item
  // list would otherwise cost 500 renders.
  let low = 0;
  let high = items.length;
  let best = { text: render([], items.length), count: 0 };

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const candidate = render(items.slice(0, mid), items.length - mid);
    if (utf8Bytes(candidate) <= maxBytes) {
      best = { text: candidate, count: mid };
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return {
    text: best.text,
    shown: items.slice(0, best.count),
    omitted: items.length - best.count,
    truncated: true
  };
}

/** True when a rendered record already fits without any trimming. */
export function fits(text: string, maxBytes: number = MAX_RESULT_BYTES): boolean {
  return utf8Bytes(text) <= maxBytes;
}

/** Joins prose notes and a JSON body into the text of a tool result. */
export function renderSections(notes: string[], body: unknown): string {
  const prose = notes.filter(Boolean).join('\n');
  const json = JSON.stringify(body, null, 2);
  return prose ? `${prose}\n\n${json}` : json;
}
