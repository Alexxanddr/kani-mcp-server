# Security model

## Assets and trust boundaries

The WaniKani personal API token and returned account/study data are sensitive. Tool arguments originate from an MCP model or user and are untrusted. WaniKani is the only default network peer; the local MCP host controls the process environment and stdio channel.

## Controls

- The token comes only from `WANIKANI_API_TOKEN` and is sent in an authorization header, never a URL.
- Remote API base URLs require HTTPS. The override is documented as a token-destination change.
- Every tool chooses an allowlisted endpoint; arbitrary URLs, methods, headers, and query names are impossible through MCP.
- Zod bounds IDs, arrays, levels, stages, percentages, timestamps, and enums.
- Only GET requests are implemented. Tool annotations accurately declare read-only/idempotent behavior.
- Error conversion includes only the HTTP status and documented `error` string, not arbitrary upstream bodies or the token.
- Subject tools enforce `subscription.max_level_granted` and fail closed when subscription metadata is absent.
- No data or credentials are persisted, and stdout is reserved for protocol messages.

## Credential guidance

Create a dedicated read-only token, store it in the MCP client's secret facility or process environment, and rotate it after suspected exposure. Do not put it in shell history, client prompts, issues, fixtures, screenshots, or `.env.example`. `.env` is ignored but remains plaintext on disk.

## Known risks

- The MCP host can see tool results and process configuration; only use a trusted host.
- A custom API base URL receives the bearer token. HTTPS protects transit but does not establish operator trust.
- WaniKani responses contain personal learning activity. The server does not redact successful data because that is its purpose.
- There is no local rate limiter. A model can cause 429 responses, although inputs cannot change data.
- Dependencies and the Node runtime remain supply-chain dependencies; lockfile and CI checks reduce, but do not remove, that risk.
- API additions can appear under the pinned revision and pass through unchanged.

## Dependency and release practice

Review lockfile changes, run `npm audit` as an advisory check, and use least-privilege GitHub Actions permissions. Never publish or release from an unreviewed or dirty tree. Public vulnerability reporting remains a maintainer decision documented in root `SECURITY.md`.
