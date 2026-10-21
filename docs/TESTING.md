# Testing

## Local checks

```sh
npm ci
npm run check
npm pack --dry-run
```

`npm run check` runs strict TypeScript checking, Node's test runner through `tsx`, and the production esbuild bundle. `npm pack --dry-run` lists distributable files without publishing.

## Test layers

- `test/client.test.ts` mocks `fetch` and checks bearer/revision headers, array and boolean query serialization, safe errors, HTTPS enforcement, and subscription restrictions.
- `test/server.test.ts` connects an SDK client and server with in-memory transport. It checks the published tool inventory, read-only annotations, validation, and endpoint delegation.

Tests must not use real tokens or personal WaniKani payloads. Keep fixtures synthetic and small. A regression for a reported bug should fail before its fix and exercise the narrowest owning layer.

## Live verification

There is no automated live suite: it would require personal credentials, consume the shared API quota, and make CI nondeterministic. Before a release, a maintainer may manually use a dedicated read-only token to call `get_user`, `get_summary`, one filtered collection, one paginated collection, and one singular resource. Do not record the output.

## Security checks

Review changed files and package contents for tokens, `.env`, personal data, local paths, and generated output. Treat `npm audit` results according to reachable runtime impact; do not update dependencies blindly solely to silence an advisory.
