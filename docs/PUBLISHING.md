# Publishing plan

## Current status

Publishing is intentionally disabled by `private: true`, `license: UNLICENSED`, and placeholder-free repository metadata. The project must not be published until the decisions below are resolved.

## Maintainer decisions

1. Confirm the product/repository/package name complies with WaniKani's branding rules. `Kani MCP Server` avoids the full mark, but final approval belongs to the maintainer and, if needed, Tofugu.
2. Choose an open-source license. MIT is simple and permissive; Apache-2.0 adds an explicit patent grant; MPL-2.0 requires modifications to covered files to remain open. Add the exact license text and update `package.json`.
3. Reserve an available npm package name and add real `repository`, `homepage`, `bugs`, and author/maintainer metadata.
4. Decide the private security reporting channel and supported-version policy.

## Recommended distribution

npm is the primary fit because the artifact is a Node.js executable and stdio MCP clients can run it with `npx`. GitHub Releases may mirror tagged source and checksums. Docker, a hosted service, and a database add no value to the local single-user design. Evaluate MCP Registry submission only after its then-current requirements are verified.

## Release procedure

1. Update `CHANGELOG.md` and version using Semantic Versioning.
2. Run `npm ci`, `npm run check`, and `npm pack --dry-run` in a clean checkout.
3. Inspect the archive contents and perform the manual read-only smoke test in `TESTING.md`.
4. Tag `vX.Y.Z`, create release notes, and publish with provenance/2FA according to the registry's current guidance.

No publish, release, registry submission, image push, deployment, or remote push is automated in this repository.
