#!/usr/bin/env node
/**
 * Acceptance criterion 3: CI fails the build if any HTTP method other than GET
 * appears in the outbound client, or if a tool is registered without
 * `readOnlyHint: true`.
 *
 * This is the "compile or runtime wall" the contract's rationale asks for
 * (§2, rationale). A contributor adding a write path does not get a passing
 * test suite — they get this.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');

/**
 * The single OAuth exemption. RFC 6749 §3.2 requires POST to the token
 * endpoint, which is Keycloak, not the Document API. Nothing else may issue a
 * non-GET request, and this list is deliberately hard to extend: adding an
 * entry is a visible change to the read-only guarantee.
 */
const NON_GET_ALLOWLIST = new Set([path.join('src', 'auth', 'tokenEndpoint.ts')]);

/** Files permitted to call fetch at all. */
const FETCH_ALLOWLIST = new Set([
  path.join('src', 'upstream', 'client.ts'),
  path.join('src', 'auth', 'tokenEndpoint.ts')
]);

/** The one file permitted to register tools. */
const REGISTRATION_SITE = path.join('src', 'tools', 'index.ts');

const REQUIRED_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

const MAX_TOOLS = 6;

const failures = [];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

const files = walk(srcDir);

for (const file of files) {
  const relative = path.relative(root, file);
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');

  lines.forEach((line, index) => {
    const at = `${relative}:${index + 1}`;

    // A request-options `method:` naming anything but GET.
    const methodOption = line.match(/method\s*:\s*['"`]([A-Za-z]+)['"`]/);
    if (methodOption && methodOption[1].toUpperCase() !== 'GET' && !NON_GET_ALLOWLIST.has(relative)) {
      failures.push(`${at}: non-GET request method "${methodOption[1]}" outside the OAuth token endpoint`);
    }

    // Anything under src/upstream/ is the Document API client: GET only, no
    // exceptions, not even an allowlisted one.
    if (relative.startsWith(path.join('src', 'upstream'))) {
      const verb = line.match(/\b(POST|PUT|PATCH|DELETE)\b/);
      if (verb) {
        failures.push(`${at}: HTTP method ${verb[1]} appears in the outbound Document API client`);
      }
    }

    // Direct network calls outside the two clients.
    if (/(?<![.\w])fetch\s*\(/.test(line) && !FETCH_ALLOWLIST.has(relative)) {
      failures.push(`${at}: direct fetch() call outside the read-only client and token endpoint`);
    }

    if (/\bserver\.(registerTool|tool)\s*\(/.test(line) && relative !== REGISTRATION_SITE) {
      failures.push(`${at}: tools may only be registered in ${REGISTRATION_SITE}`);
    }
  });
}

// The read-only client must expose exactly one operation.
const clientSource = readFileSync(path.join(srcDir, 'upstream', 'client.ts'), 'utf8');
const clientInterface = clientSource.match(/export interface ReadOnlyHttpClient \{([\s\S]*?)\n\}/);
if (!clientInterface) {
  failures.push('src/upstream/client.ts: ReadOnlyHttpClient interface not found');
} else {
  const members = [...clientInterface[1].matchAll(/^\s{2}(\w+)\s*[<(]/gm)].map(match => match[1]);
  if (members.length !== 1 || members[0] !== 'get') {
    failures.push(
      `src/upstream/client.ts: ReadOnlyHttpClient must expose exactly one member, "get"; found [${members.join(', ')}]`
    );
  }
}

// The registered tool surface, taken from the real registration path.
let tools = [];
try {
  const output = execFileSync(
    process.execPath,
    [path.join(root, 'node_modules', 'tsx', 'dist', 'cli.mjs'), path.join(root, 'scripts', 'probe-tools.ts')],
    { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
  );
  tools = JSON.parse(output);
} catch (error) {
  failures.push(`could not enumerate the tool surface: ${error.message}`);
}

if (tools.length > MAX_TOOLS) {
  failures.push(
    `${tools.length} tools registered, ${MAX_TOOLS} permitted by the build contract (§4). Adding one requires an amendment.`
  );
}

for (const tool of tools) {
  for (const [key, expected] of Object.entries(REQUIRED_ANNOTATIONS)) {
    if (tool.annotations?.[key] !== expected) {
      failures.push(
        `tool "${tool.name}" declares ${key}=${JSON.stringify(tool.annotations?.[key])}, contract §4.1 requires ${expected}`
      );
    }
  }
  if (!tool.description || tool.description.length < 40) {
    failures.push(`tool "${tool.name}" has no usable description (contract §4.2)`);
  }
}

if (failures.length > 0) {
  console.error('read-only check FAILED');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(
  `read-only check passed: ${files.length} source files scanned, ${tools.length} tools, all read-only`
);
