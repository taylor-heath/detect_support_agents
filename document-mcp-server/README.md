# Document Service — read-only MCP server

A thin MCP adapter over the read-only Document Service API. It terminates MCP,
validates arguments, GETs the HTTP API described in [`openapi.yaml`](./openapi.yaml),
and reshapes responses for a context window. It holds no business logic and no
persistent state.

Built to [`docs/build-contract.md`](./docs/build-contract.md) v1.0. Section
references throughout the source point back at it.

## Read-only, structurally

The contract asks for read-only to be a property of the deployment rather than
of today's tool list, so three independent mechanisms hold it up:

| Mechanism | Where | What it stops |
|---|---|---|
| One-function client | `src/upstream/client.ts` — `ReadOnlyHttpClient` exposes only `get`, and the frozen instance cannot be extended | A write attempt fails to typecheck; there is no verb to name |
| Runtime assertion | Same file — the constructed `Request`'s method is checked against `GET` before dispatch | A write built by reflection or a bad merge dies before the network |
| CI gate | `scripts/check-readonly.mjs`, `scripts/check-openapi.mjs` | A non-GET method anywhere outside the OAuth token endpoint, a tool registered without `readOnlyHint: true`, a seventh tool, a `POST` added to the spec |

Tools are declared as data in `src/tools/index.ts` and registered by one loop
that applies the contracted annotations unconditionally — a tool definition has
no way to supply its own. `test/readOnlyGuard.test.ts` deliberately introduces
each violation and asserts the CI gate fails, so the gate is known to work.

The single exemption is `src/auth/tokenEndpoint.ts`, which POSTs to Keycloak
because RFC 6749 §3.2 requires it. That file is allowlisted by name and may not
take a URL, method, or path from a caller.

## Tools

Six, and adding a seventh requires an amendment to the contract.

| Tool | API operation | Returns |
|---|---|---|
| `list_templates` | `listTemplates` + `listSchemas` | Template summaries for a target, plus the payload schema ids available |
| `get_template` | `getTemplate` | One template's layouts, slots, slot limits and named styles |
| `get_payload_schema` | `getSchema` | A JSON Schema document, usable verbatim as a structured-output constraint |
| `list_render_jobs` | `listJobs` | Recent jobs, newest first, filterable by status, target and date range |
| `get_render_job` | `getJob` + `listJobArtifacts` | One job's status, timings, errors with JSON Pointers, and artifact metadata |
| `get_artifact_link` | `getArtifactDownloadUrl` | A short-lived signed URL for a produced file |

`getHealth` and `getArtifact` are not exposed, and the data of `listSchemas` and
`listJobArtifacts` is folded into the tools above — each extra tool costs host
context on every turn and increases mis-selection.

Artifact bytes are never returned, and `get_render_job` never sends
`include=payload`, so a submitted payload cannot reach the model.

## Response shaping

The API's representations are sized for programmatic clients; tool results are
sized for a context window (`src/shaping/`).

- **Trimmed** — `checksumSha256`, `submittedBy` and `artifact.jobId` are dropped.
  `artifact.id` survives, because it is the argument `get_artifact_link` needs.
- **Pagination honesty** — when `nextCursor` is non-null the result says so in
  words and quotes the cursor, so the model continues rather than assuming it
  has seen everything.
- **25 KB ceiling** — item lists are truncated by bisection, never an individual
  record mid-structure, and the result states how many items were omitted. A
  JSON Schema that would exceed the ceiling is refused with an explanation
  rather than returned in a form that would no longer be a valid schema.
- **Error detail** — `errors[].pointer` is preserved verbatim.

## Authentication

**Inbound (HTTP transport only).** Bearer tokens are verified against the
Keycloak realm JWKS, cached with a bounded refresh interval. `docs:read` is
required; a token that carries any *other* capability scope is refused with
`403 insufficient_scope`, since this server must never be the thing that spends
a broader grant. A token with no `exp` claim is invalid. Both the 401 and the
403 carry `WWW-Authenticate: Bearer` with a `resource_metadata` parameter.

The RFC 9728 protected resource metadata document is served at both
`/.well-known/oauth-protected-resource` and the path-suffixed form. Its
`resource` field is echoed verbatim from `DOCS_MCP_RESOURCE_URL` rather than
rebuilt from request headers, which a reverse proxy is free to rewrite.

The server is a resource server only: it mounts no authorization endpoints.

**Outbound.** `forward` passes the caller's verified token upstream unchanged;
`exchange` trades it (RFC 8693) for one scoped to the API audience, always
requesting `docs:read` and nothing more. Neither mode falls back to a service
account, so the upstream call can never exceed the caller's own permissions.
Under stdio, where no inbound token exists, locally configured client
credentials are used with `docs:read`.

### Keycloak client configuration

For the deploying team, per contract §6:

- Redirect URI `https://claude.ai/api/mcp/auth_callback`; for Claude Code, also
  the loopback forms with port-agnostic matching.
- PKCE S256 required.
- An audience mapper so `aud` names the Document API — Keycloak does not add one
  by default, and without it the API rejects a forwarded token.
- `offline_access` advertised, so a refresh token is issued.
- Refresh token rotation enabled.

## Error handling

Anything the model can react to comes back as an ordinary result with
`isError: true`, so it can read the failure and adapt: `400` quotes the problem
detail and every pointer, `404` names the identifier to check, `410` says the
artifact expired, `429` reports the wait, `5xx` says a retry was already
attempted. A short `429` (Retry-After under 5s) and a `5xx` are each retried
once inside the client before that.

Authentication faults are not tool results. An upstream `401`/`403` sets a
`WWW-Authenticate` challenge on the MCP response and raises a protocol error, so
the host re-authenticates instead of the model reading an auth failure as data.
Note the limit of the transport here: once a JSON-RPC exchange is in flight the
HTTP status cannot be changed, so the challenge travels as a header on a 200
alongside a JSON-RPC error rather than as a fresh 401.

## Running it

```bash
npm ci
cp env.example .env        # then fill in for your environment
npm run verify             # spec gate, read-only gate, typecheck, tests
npm run build
```

Transports share one `McpServer`; only the entry point differs.

```bash
npm run start:stdio        # local development, Claude Desktop / Claude Code
npm run start:http         # remote connector for Claude.ai web and mobile
```

### How configuration reaches the process

The server reads `process.env`. There is no dotenv dependency, but the two
entry points do look for a local `.env` before config is read, so a development
run works whatever directory it was launched from:

1. `DOCS_MCP_ENV_FILE`, when set — an explicit path always wins.
2. `.env` in the current working directory.
3. `.env` beside the package root, found by walking up from the running file.

A real environment variable always beats the file, so a deployed process cannot
be re-pointed by a stray `.env` in the image. In production, inject these as
environment variables from your platform or secrets manager and ship no `.env`
at all.

The startup log says which file was read:

```json
{"event":"env_file_loaded","file":"/opt/document-mcp-server/.env","applied":5,"overriddenByEnvironment":0}
```

If a variable is missing, that line — or an `env_file_absent` line listing the
paths searched — tells you whether the file was found at all before you start
questioning its contents.

Claude Desktop / Claude Code, stdio:

```json
{
  "mcpServers": {
    "documents": {
      "command": "node",
      "args": ["/opt/document-mcp-server/dist/bin/stdio.js"],
      "env": {
        "DOCS_API_BASE_URL": "https://api.example.com/v1",
        "DOCS_MCP_ISSUER_URL": "https://auth.example.com/realms/docs",
        "DOCS_MCP_CLIENT_ID": "document-mcp-local"
      }
    }
  }
}
```

As a Claude.ai custom connector, point the connector at
`https://mcp.example.com/mcp` and set `DOCS_MCP_RESOURCE_URL` to that exact
string — the metadata document's `resource` must match it character for
character, path included, or the OAuth flow will not complete.

## Layout

```
src/
  constants.ts          values the contract fixes: scope, ceiling, timeouts, tool count
  config.ts             environment only; no hostname, client id or secret in source
  envFile.ts            finds a local .env for development runs; environment still wins
  logging.ts            one structured line per tool call, to stderr
  upstream/client.ts    the GET-only Document API client
  upstream/errors.ts    upstream failures, modelled for the §7 mapping
  auth/verifier.ts      inbound JWKS verification and the scope ceiling
  auth/metadata.ts      RFC 9728 protected resource metadata
  auth/tokenEndpoint.ts the one allowlisted POST — Keycloak, not the API
  auth/outbound.ts      forward / exchange / local credential strategies
  shaping/budget.ts     the 25 KB ceiling and truncation
  shaping/shape.ts      field trimming
  tools/                argument schemas, handlers, the six-tool registry
  transports/           stdio and Streamable HTTP
scripts/                the two CI gates and the tool-surface probe
test/                   the acceptance criteria, exercised
```

## Non-functional

Adapter overhead is asserted under 50 ms at p95 excluding the upstream call.
Upstream calls time out at 10 s, OAuth discovery and token at 10 s, refresh at
30 s. Instances are stateless: a Streamable HTTP transport is created per
request and discarded with it, so there is no session affinity. Logs carry tool
name, caller subject, upstream status and duration — never argument values, and
never tokens.

## Out of scope

Write operations, job submission, template authoring, the renderer, artifact
storage lifecycle, and any user interface. Write capability, if it is ever
required, is a separate specification, a separate scope, and a separate
deployment — not an extension of this one.
