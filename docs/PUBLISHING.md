# Publishing plan

## Current status

Publishing is intentionally disabled by `private: true`. The project uses the MIT License, GitHub metadata points to `Alexxanddr/kani-mcp-server`, and the npm name returned 404 (available) on 2026-10-21. Availability is not reserved until publication.

## Maintainer decisions

1. Confirm the product/repository/package name complies with WaniKani's branding rules. `Kani MCP Server` avoids the full mark, but final approval belongs to the maintainer and, if needed, Tofugu.
2. Decide the private security reporting channel and supported-version policy.
3. Explicitly approve the first release and remove `private: true` only immediately before publishing.

## Recommended distribution

npm is the primary fit because the artifact is a Node.js executable and stdio MCP clients can run it with `npx`. GitHub Releases may mirror tagged source and checksums. Docker, a hosted service, and a database add no value to the local single-user design. Evaluate MCP Registry submission only after its then-current requirements are verified.

## Release procedure

1. Update `CHANGELOG.md` and version using Semantic Versioning.
2. Run `npm ci`, `npm run check`, and `npm pack --dry-run` in a clean checkout.
3. Inspect the archive contents and perform the manual read-only smoke test in `TESTING.md`.
4. Tag `vX.Y.Z`, create release notes, and publish with provenance/2FA according to the registry's current guidance.

No publish, release, registry submission, image push, deployment, or remote push is automated in this repository.
