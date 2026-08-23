# Build Contract — Read-Only Document MCP Server

**Version** 1.0 · **Status** For implementation · **Companion artifact** `openapi.yaml`

---

## 1. Purpose

Expose the Document Service to MCP-compatible hosts (Claude Desktop, Claude Code,
Claude.ai custom connectors) as a **strictly read-only** tool surface. The server
is a thin adapter: it terminates MCP, validates arguments, calls the HTTP API
defined in `openapi.yaml`, and shapes responses for consumption by a language
model. It holds no business logic and no persistent state.

## 2. Non-goals — binding constraints

These are contract terms, not preferences. An implementation that violates any
of them does not satisfy this contract.

1. **No write operations.** The server MUST NOT expose any tool that creates,
   updates, deletes, submits, approves, or otherwise mutates state.
2. **No non-GET HTTP.** The HTTP client MUST be constructed such that only GET
   is reachable. Enforce structurally — a wrapper exposing a single
   `get(path, params)` function — not by convention or code review.
3. **No credential of write capability.** The Keycloak client used by this
   server is granted `docs:read` and no other scope. If the deployment
   environment offers a token with broader scope, the server MUST NOT use it.
4. **No inline binary.** Artifact bytes are never returned in a tool result.
   Tools return signed URLs.
5. **No authorization server.** The server is an OAuth resource server only. It
   verifies tokens; it never issues them.

> Rationale for (1)–(3): read-only must be a property of the deployment, not a
> property of the current tool list. A future contributor adding a `create_job`
> tool should hit a compile or runtime wall, not a passing test suite.

## 3. Architecture

```
Host (Claude)  ──MCP/Streamable HTTP──▶  MCP Server  ──HTTPS GET──▶  Document API
                                              │
                                              └── JWKS ──▶ Keycloak (docs realm)
```

The MCP server and the Document API MAY be co-located. The MCP server MUST NOT
be a network hop the API depends on — the API remains independently callable.

**Transport.** Both MUST be supported from the same `McpServer` instance:

| Transport | Use |
|---|---|
| stdio | Local development; Claude Desktop / Claude Code on the operator's machine |
| Streamable HTTP | Remote connector for Claude.ai web and mobile |

Handlers MUST read caller identity defensively (`ctx.http?.authInfo`), which is
absent under stdio.

## 4. Tool surface

Six tools. Adding a seventh requires an amendment to this contract.

| Tool | API operation | Purpose |
|---|---|---|
| `list_templates` | `listTemplates` | Discover available templates, optionally by target |
| `get_template` | `getTemplate` | Layouts, style names, and slot limits for one template |
| `get_payload_schema` | `getSchema` | Retrieve a JSON Schema for constrained payload generation |
| `list_render_jobs` | `listJobs` | Recent jobs, filterable by status, target, and date range |
| `get_render_job` | `getJob` | One job: status, timings, errors, artifact references |
| `get_artifact_link` | `getArtifactDownloadUrl` | Short-lived signed URL for a produced file |

`listSchemas`, `listJobArtifacts`, `getArtifact`, and `getHealth` are
intentionally **not** exposed as tools. Their data is folded into the six above
(schema list into `list_templates`; artifacts into `get_render_job`), because
each additional tool consumes host context on every turn and increases
mis-selection. They remain available on the HTTP API for other clients.

### 4.1 Annotations

Every tool MUST declare:

```json
{ "readOnlyHint": true, "destructiveHint": false, "idempotentHint": true, "openWorldHint": false }
```

### 4.2 Descriptions

The `description` field is read by the model on every turn and is the only
signal for tool selection. Descriptions MUST state what the tool returns and
when to prefer it over a sibling. They MUST NOT restate the argument schema.

### 4.3 Input schemas

Arguments MUST be validated before the handler runs, against schemas derived
from the OpenAPI parameters. Specifically:

- `limit` — integer 1–100, default 20. Values above 100 are clamped, not rejected.
- `cursor` — opaque string, passed through untouched.
- `target` — enum `pptx | docx | html`.
- `status` — enum `queued | running | succeeded | failed | expired`.
- Identifiers — pattern-matched per `openapi.yaml` before any HTTP call.

## 5. Response shaping

The API's representations are sized for programmatic clients. Tool results are
sized for a context window. The server MUST reshape, and this is the main piece
of work in the adapter.

| Rule | Requirement |
|---|---|
| Field trimming | Omit `checksumSha256`, `submittedBy`, and internal identifiers from tool results unless the tool's purpose is to surface them |
| Payload exclusion | `get_render_job` MUST NOT pass `include=payload`. Submitted payloads are never returned to the model |
| Pagination honesty | When `nextCursor` is non-null, the result MUST say so in words, with the cursor value, so the model can continue rather than assume completeness |
| Result ceiling | A single tool result MUST NOT exceed 25 KB of text. Truncate the item list, never an individual record mid-structure, and state how many items were omitted |
| Error detail | `errors[].pointer` MUST be preserved verbatim — a JSON Pointer into a failed payload is the single most useful field for a model diagnosing a bad render |

## 6. Authentication

**Inbound (host → MCP server), HTTP transport only.**

- Bearer token verification against the Keycloak realm JWKS, cached with a
  bounded refresh interval.
- Required scope: `docs:read`. Absent → `403 insufficient_scope`.
- Missing, malformed, or expired token → `401 invalid_token`.
- Both responses MUST carry `WWW-Authenticate: Bearer` with a
  `resource_metadata` parameter.
- Token expiry MUST be populated from the JWT `exp` claim. An unset expiry is
  treated as an invalid token.
- The server MUST publish an RFC 9728 protected resource metadata document
  whose `resource` field exactly matches the URL the host was configured with,
  including path, and whose `authorization_servers` lists the Keycloak issuer.

**Outbound (MCP server → Document API).**

- The verified caller's token is forwarded, or exchanged (RFC 8693) for one
  scoped to the API audience. Which, is a deployment decision; both are
  acceptable. A service account that elevates beyond the caller's own
  permissions is **not**.
- Under stdio, where no inbound token exists, the server uses locally
  configured credentials with `docs:read`.

**Keycloak client configuration** (informative, for the deploying team):

- Redirect URI `https://claude.ai/api/mcp/auth_callback`; for Claude Code also
  the loopback forms with port-agnostic matching.
- PKCE S256 required.
- Audience mapper set so `aud` names the Document API — Keycloak does not do
  this by default.
- `offline_access` advertised so a refresh token is issued.
- Refresh token rotation enabled; `invalid_grant` returned for dead refresh tokens.

## 7. Error handling

API problem details map to tool results, not transport failures:

| API response | Tool result |
|---|---|
| `400` | `isError: true`, message quoting `detail` and any `errors[].pointer` |
| `401` / `403` | Propagate as an HTTP-layer challenge on the MCP response, not a tool result |
| `404` | `isError: true`, "no such {resource} — check the identifier" |
| `410` | `isError: true`, stating the artifact expired |
| `429` | Retry once honouring `Retry-After` when it is under 5s; otherwise `isError: true` |
| `5xx` | Retry once with jitter; then `isError: true` |

Returning `isError: true` inside an ordinary result lets the model read the
failure and adapt. Transport-level errors end the exchange and MUST be reserved
for authentication and protocol faults.

## 8. Non-functional requirements

- **Latency.** p95 tool-call overhead added by the adapter ≤ 50 ms excluding the
  upstream API call.
- **Timeouts.** Upstream calls time out at 10 s. OAuth discovery and token
  endpoints must respond within 10 s, refresh within 30 s — a slow identity
  provider produces intermittent connection failures that present as unrelated bugs.
- **Statelessness.** No session affinity. Any instance serves any request.
- **Logging.** Structured, one line per tool call: tool name, caller subject,
  upstream status, duration. Argument values MUST NOT be logged. Tokens MUST NOT
  be logged.
- **No secrets in source.** Realm URLs, client IDs, and any secret come from
  environment or a secrets manager.

## 9. Acceptance criteria

Delivery is complete when all of the following hold.

1. `openapi.yaml` validates against OpenAPI 3.1 and contains zero non-GET operations.
2. All six tools are listed by an MCP client and callable end to end against a
   running Document API.
3. A static check in CI fails the build if any HTTP method other than GET
   appears in the outbound client, or if a tool is registered without
   `readOnlyHint: true`.
4. An unauthenticated Streamable HTTP request returns `401` with a
   `WWW-Authenticate` header carrying `resource_metadata`.
5. A token bearing scopes other than `docs:read` returns `403 insufficient_scope`.
6. The protected resource metadata document resolves and its `resource` field
   matches the configured server URL exactly.
7. Adding the server as a Claude custom connector completes the OAuth flow
   against Keycloak and lists all six tools.
8. The same `McpServer` runs under stdio with no code change beyond transport
   selection.
9. A `list_render_jobs` call against a dataset of 500 jobs returns within the
   25 KB ceiling and reports the remaining count.
10. No tool returns binary content under any input.

## 10. Out of scope

Write operations; job submission; template authoring; the renderer itself;
artifact storage lifecycle; any user interface. Write capability, if later
required, is a separate specification, a separate scope, and a separate
deployment — not an extension of this one.
