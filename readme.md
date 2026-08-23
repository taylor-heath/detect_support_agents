# detect_support_agents

Git-backed request/claim/result queue used to coordinate work with agents.

- `requests/`, `claims/`, `results/` — the job queue itself.
- `data/configs/` — evaluation and custom report configurations.
- `document-mcp-server/` — read-only MCP server exposing the Document Service
  API to MCP hosts. See its [README](./document-mcp-server/README.md).
