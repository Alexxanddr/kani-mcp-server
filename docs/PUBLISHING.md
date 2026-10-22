# Publishing plan

## Package status

The package is configured for public publication to `https://registry.npmjs.org/`. It uses the MIT License, GitHub metadata points to `Alexxanddr/kani-mcp-server`, and the npm name returned 404 (available) on 2026-10-21. Availability is not reserved until the first publication succeeds.

## Trusted publisher setup

1. Confirm the product/repository/package name complies with WaniKani's branding rules. `Kani MCP Server` avoids the full mark, but final approval belongs to the maintainer and, if needed, Tofugu.
2. Enable GitHub private vulnerability reporting or publish another private security contact.
3. Enable two-factor authentication on the npm maintainer account and authenticate with `npm login`.
4. On npmjs.com, open `kani-mcp-server` → Settings → Trusted Publisher and configure GitHub Actions with:
   - organization or user: `Alexxanddr`
   - repository: `kani-mcp-server`
   - workflow filename: `publish.yml`
   - direct `npm publish` permission enabled
5. Complete the first trusted workflow publication within two days of configuring it, or npm will expire the unvalidated relationship.

Trusted publishing uses short-lived OIDC credentials, requires no `NPM_TOKEN` secret, and automatically attaches provenance for a public GitHub repository. After it succeeds, configure npm publishing access to require 2FA and disallow traditional tokens.

## MCP Registry

The same release workflow publishes `server.json` to the official MCP Registry after npm accepts the package. The registry entry is `io.github.alexxanddr/kani-mcp-server`; `package.json` and the packaged README contain that same `mcpName` so the registry can verify package ownership.

No MCP Registry secret is required. GitHub OIDC authenticates the repository namespace through the workflow's `id-token: write` permission. The Registry is currently in preview, so its schema or stored data may change before general availability.

## Recommended distribution

npm is the primary fit because the artifact is a Node.js executable and stdio MCP clients can run it with `npx`. GitHub Releases may mirror tagged source and checksums. Docker, a hosted service, and a database add no value to the local single-user design. Evaluate MCP Registry submission only after its then-current requirements are verified.

## Automated release procedure

1. Update `CHANGELOG.md` and set the version with `npm version <major|minor|patch> --no-git-tag-version`.
2. Run `npm ci`, `npm run check`, and `npm publish --dry-run` in a clean checkout.
3. Inspect the archive contents and perform the manual read-only smoke test in `TESTING.md`.
4. Commit the version, tag it as `vX.Y.Z`, and push the commit and tag.
5. Publish a GitHub release for that exact tag. `.github/workflows/publish.yml` verifies that the release tag and registry metadata match the package version, publishes to npm using OIDC, waits for registry visibility, then publishes the same version to the MCP Registry.

The workflow can also be retried manually with `workflow_dispatch`. Manual runs still enforce package/registry metadata consistency, skip an npm version that is already present, and republish its MCP Registry metadata. Registry submission, image deployment, and remote pushes are not otherwise automated.
