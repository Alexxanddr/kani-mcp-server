---
name: review-mcp-server
description: Review Kani MCP Server for contract correctness, API safety, security, compatibility, tests, and documentation.
---

# Review Kani MCP Server

Read `AGENTS.md` and relevant source, tests, package configuration, and docs. Review changed code and every caller; verify behavior in code and official WaniKani documentation.

Check MCP names, descriptions, annotations, schemas, outputs, errors, and compatibility; token/base-URL handling, subscription limits, validation, sensitive output, and read-only guarantees; endpoint filters, revision header, pagination, rate limits, and drift risk; component boundaries and dependencies; test coverage; documentation accuracy; branding; and package compatibility.

Run the smallest relevant checks, normally `npm run check`; use `npm pack --dry-run` for package changes. Never use a real token or live write endpoint during review.

Report findings first, ordered by severity:

```text
[critical|high|medium|low] Short title
File: path:line
Impact: concrete user/security/compatibility consequence
Evidence: observed code or failing test
Recommendation: smallest concrete correction
```

Do not report style preferences as defects. If there are no findings, say so and list residual risks or untested areas. End with checks run and documentation discrepancies. A review does not authorize code changes, publishing, deployment, or remote operations.
