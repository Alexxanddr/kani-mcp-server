---
name: add-mcp-tool
description: Add or change a Kani MCP Server tool while preserving contracts, read-only safety, tests, and documentation.
---

# Add a Kani MCP Server tool

1. Read `AGENTS.md`, `docs/ARCHITECTURE.md`, and `docs/MCP_CONTRACTS.md` completely.
2. Inspect `src/server.ts`, relevant `WaniKaniClient` methods, callers, and tests before editing.
3. Confirm the endpoint, filters, revision behavior, subscription restrictions, and read/write effect in official WaniKani API documentation. Stop for an explicit product/security decision on writes.
4. Choose a stable `snake_case` name and concise description distinct from existing tools. Preserve existing names and semantics.
5. Define the narrowest Zod input schema. Constrain arrays, enums, dates, IDs, ranges, and paths.
6. Put reusable HTTP/business behavior in `src/client.ts`; keep MCP formatting and registration in `src/server.ts`. Add no wrapper or dependency without a concrete need.
7. Use shared request/error paths. Never log tokens or personal response data. Enforce `max_level_granted` for subject content.
8. Add a focused client test for request/security logic and an MCP contract test for inventory, schema, or delegation.
9. Update the README tool table and `docs/MCP_CONTRACTS.md`; update architecture, security, testing, installation, and publishing docs only when affected.
10. Do not rename/remove a tool, narrow inputs, or alter output semantics without an explicitly documented breaking release.
11. Run `npm run check` and `npm pack --dry-run`. Do not use live credentials in automated tests.
12. Report the contract, files changed, checks run, and upstream uncertainty. Do not publish or push.
