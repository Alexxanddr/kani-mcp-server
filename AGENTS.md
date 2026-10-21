# Kani MCP Server agent instructions

## Project overview

Kani MCP Server is an independent read-only TypeScript MCP server for WaniKani API v2. It uses the official `@modelcontextprotocol/sdk`, Zod, Node.js 18+, and stdio transport.

- `src/client.ts`: authenticated HTTP integration and query serialization.
- `src/server.ts`: MCP tool registration, schemas, and result conversion.
- `src/index.ts`: environment configuration and stdio startup.
- `test/`: unit and MCP contract tests.
- `docs/`: architecture, contracts, security, testing, and publishing references.

Read `docs/ARCHITECTURE.md` before changing boundaries and `docs/MCP_CONTRACTS.md` before changing a public tool.

## Architecture rules

- Keep WaniKani HTTP details in `WaniKaniClient`; keep protocol registration in `createServer`.
- Reuse the shared request and MCP result/error paths.
- Keep the server read-only unless a separately reviewed change explicitly adds writes.
- Prefer existing helpers, standard platform features, and current dependencies.
- Use ESM imports with `.js` suffixes.

## MCP development rules

- Use stable `snake_case` tool names and concise action-oriented descriptions.
- Validate every external input with the narrowest practical Zod schema.
- Return API JSON as text content and expected failures with `isError: true`.
- Treat tool names, schemas, output shapes, and semantics as public contracts.
- New or changed tools require contract tests plus README and `docs/MCP_CONTRACTS.md` updates.
- Add resources or prompts only for a demonstrated user workflow.

## Security rules

- Read credentials only from `WANIKANI_API_TOKEN`; never commit, log, snapshot, or return tokens.
- Require HTTPS for remote API base URLs and warn when configuration changes the token destination.
- Validate MCP inputs, allowlist API paths, and never accept arbitrary URLs.
- Keep diagnostics on stderr; stdout is reserved for MCP stdio.
- Request and recommend a read-only WaniKani token.

## Development workflow

1. Inspect relevant callers, tests, and documentation before editing.
2. Make the smallest focused change and preserve unrelated work.
3. Do not add dependencies without a concrete need.
4. Update tests and docs when behavior, configuration, contracts, installation, architecture, or security changes.
5. Never publish, deploy, release, or push without explicit authorization.

## Testing and validation

- Run `npm run check` for type checking, unit/contract tests, and a production build.
- Run `npm pack --dry-run` before a release.
- Do not add live tests that depend on a maintainer's personal data or write to WaniKani.
- For security-sensitive changes, verify errors, logs, fixtures, and generated files contain no credentials.

## Completion checklist

- Contracts remain compatible or the breaking change is explicitly documented.
- Relevant tests pass and documentation is current.
- Package contents are valid and no secret or personal data was added.
- The final report states changes, actual checks, and remaining limitations.
