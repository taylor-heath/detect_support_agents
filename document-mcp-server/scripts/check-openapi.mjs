#!/usr/bin/env node
/**
 * Acceptance criterion 1: `openapi.yaml` validates against OpenAPI 3.1 and
 * contains zero non-GET operations.
 *
 * Run in CI. A spec that grows a POST fails the build, which is the point —
 * read-only is meant to be a property of the deployment, not of today's file.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parse } from 'yaml';
import { validate } from '@readme/openapi-parser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const specPath = path.join(root, 'openapi.yaml');

const HTTP_METHODS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];
const WRITE_METHODS = HTTP_METHODS.filter(method => method !== 'get');

const failures = [];

const spec = parse(readFileSync(specPath, 'utf8'));

if (!/^3\.1\.\d+$/.test(spec.openapi ?? '')) {
  failures.push(`openapi.yaml declares version "${spec.openapi}", expected 3.1.x`);
}

const result = await validate(structuredClone(spec));
if (!result.valid) {
  const detail =
    result.errors?.map(error => `${error.instancePath ?? ''} ${error.message}`).join('; ') ??
    result.additionalErrors ??
    'unknown validation failure';
  failures.push(`openapi.yaml is not a valid OpenAPI document: ${detail}`);
}

for (const [pathKey, pathItem] of Object.entries(spec.paths ?? {})) {
  for (const method of WRITE_METHODS) {
    if (pathItem && Object.hasOwn(pathItem, method)) {
      failures.push(`${pathKey} declares a ${method.toUpperCase()} operation; this spec is read-only`);
    }
  }
}

const scopes = new Set();
for (const requirement of spec.security ?? []) {
  for (const list of Object.values(requirement)) {
    for (const scope of list ?? []) scopes.add(scope);
  }
}
if (scopes.size !== 1 || !scopes.has('docs:read')) {
  failures.push(
    `global security must require exactly the docs:read scope, found [${[...scopes].join(', ')}]`
  );
}

if (failures.length > 0) {
  console.error('openapi check FAILED');
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`openapi check passed: 3.1 valid, ${Object.keys(spec.paths ?? {}).length} paths, GET only`);
