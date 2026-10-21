# Publishing plan

## Package status

The package is configured for public publication to `https://registry.npmjs.org/`. It uses the MIT License, GitHub metadata points to `Alexxanddr/kani-mcp-server`, and the npm name returned 404 (available) on 2026-10-21. Availability is not reserved until the first publication succeeds.

## First release and trusted publisher setup

1. Confirm the product/repository/package name complies with WaniKani's branding rules. `Kani MCP Server` avoids the full mark, but final approval belongs to the maintainer and, if needed, Tofugu.
2. Enable GitHub private vulnerability reporting or publish another private security contact.
3. Enable two-factor authentication on the npm maintainer account and authenticate with `npm login`.
4. Run the validation steps below, then publish `0.1.0` manually with `npm publish --access public`. The package must exist before its npm trusted publisher can be configured.
5. On npmjs.com, open `kani-mcp-server` → Settings → Trusted Publisher and configure GitHub Actions with:
   - organization or user: `Alexxanddr`
   - repository: `kani-mcp-server`
   - workflow filename: `publish.yml`
   - direct `npm publish` permission enabled
6. Complete the first trusted workflow publication within two days of configuring it, or npm will expire the unvalidated relationship.

Trusted publishing uses short-lived OIDC credentials, requires no `NPM_TOKEN` secret, and automatically attaches provenance for a public GitHub repository. After it succeeds, configure npm publishing access to require 2FA and disallow traditional tokens.

## Recommended distribution

npm is the primary fit because the artifact is a Node.js executable and stdio MCP clients can run it with `npx`. GitHub Releases may mirror tagged source and checksums. Docker, a hosted service, and a database add no value to the local single-user design. Evaluate MCP Registry submission only after its then-current requirements are verified.

## Automated release procedure

1. Update `CHANGELOG.md` and set the version with `npm version <major|minor|patch> --no-git-tag-version`.
2. Run `npm ci`, `npm run check`, and `npm publish --dry-run` in a clean checkout.
3. Inspect the archive contents and perform the manual read-only smoke test in `TESTING.md`.
4. Commit the version, tag it as `vX.Y.Z`, and push the commit and tag.
5. Publish a GitHub release for that exact tag. `.github/workflows/publish.yml` verifies that the tag equals the package version, runs the package checks through `prepack`, and publishes to npm using OIDC.

The workflow runs only when a maintainer publishes a GitHub release. Registry submission, image deployment, and remote pushes are not otherwise automated.
