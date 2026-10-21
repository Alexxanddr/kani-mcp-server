# Contributing

## Setup

Install Node.js 18 or newer, fork and clone the repository, then run:

```sh
npm ci
npm run check
```

Use `.env.example` only as a template. Never commit a real token or personal API response.

## Changes

- Open an issue before a large contract or architecture change.
- Keep HTTP behavior in `src/client.ts` and MCP schemas/registration in `src/server.ts`.
- Preserve existing tool names and behavior unless the change is explicitly breaking.
- Use the `.agents/skills/add-mcp-tool` workflow for new tools.
- Add focused tests and update the README tool table and `docs/MCP_CONTRACTS.md`.
- Keep new features read-only unless write access has separate security and product approval.

## Pull requests

Explain user-visible behavior, API endpoints, contract impact, and checks run. `npm run check` must pass. Run `npm pack --dry-run` for packaging changes. Do not include credentials, personal WaniKani data, generated `dist/`, or package archives.
