# WaniKani API research for Kani MCP Server

Research date: 2026-10-21. This note records implementation facts from the
official WaniKani API reference and a source review of the suggested example
repository.

## API contract

- The API base is `https://api.wanikani.com/v2`. Every request requires HTTPS
  and `Authorization: Bearer <personal-api-token>`; third-party applications
  must use personal API tokens rather than asking for WaniKani credentials.
  [Authentication](https://docs.api.wanikani.com/20170710/#authentication)
- Send `Wanikani-Revision: 20170710` explicitly. Omitting it currently falls
  back to that first revision, but an explicit header makes the contract
  deliberate. Breaking changes create a new date-stamped revision; additive
  changes can appear in every revision.
  [Revisions](https://docs.api.wanikani.com/20170710/#revisions-aka-versioning)
- Successful singular resources have `id`, `object`, `url`,
  `data_updated_at`, and `data`; collections add `pages`, `total_count`, and an
  array in `data`. Error bodies, when supplied, use `{ "error": string,
  "code": integer }`.
  [Response structure](https://docs.api.wanikani.com/20170710/#response-structure),
  [Errors](https://docs.api.wanikani.com/20170710/#errors)
- Collection pagination is cursor-based. Consumers should follow
  `pages.next_url` until it is `null`, rather than manufacture cursors. The
  normal maximum is 500 objects per page; `reviews` and `subjects` allow 1,000.
  [Pagination](https://docs.api.wanikani.com/20170710/#pagination)
- The documented quota is 60 requests per minute. A `429` response indicates
  exhaustion, and `RateLimit-Limit`, `RateLimit-Remaining`, and
  `RateLimit-Reset` response headers expose the server's state. A client should
  surface useful API errors and honor reset timing rather than silently retry
  forever.
  [Rate limit](https://docs.api.wanikani.com/20170710/#rate-limit)
- Every collection supports `updated_after`. It is useful for a later caching
  or sync layer, but unnecessary for a stateless first release.
  [Leveraging `updated_after`](https://docs.api.wanikani.com/20170710/#leveraging-the-updated_after-filter)
- The user's `subscription.max_level_granted` must be respected. The API docs
  explicitly require applications not to expose content above that level.
  [User subscription attributes](https://docs.api.wanikani.com/20170710/#subscription-object-attributes)
- Branding rules say the product name must not contain “WaniKani”; the service
  may be identified in a subtitle/description only when the app is clearly
  marked unofficial or third-party. A repository/package called
  `wanikani-mcp` is therefore a compliance risk worth renaming before public
  distribution.
  [Branding rules](https://docs.api.wanikani.com/20170710/#naming-conventions)

## Small useful read-only surface

The API already supplies the core facts without a database or background
scheduler:

1. `GET /user` validates the token and returns identity, current level, and
   subscription limits.
   [User](https://docs.api.wanikani.com/20170710/#user)
2. `GET /summary` returns lessons available now, reviews available now and for
   the next 24 hours, and `next_reviews_at`.
   [Summary](https://docs.api.wanikani.com/20170710/#summary)
3. `GET /assignments` supports useful filters such as
   `immediately_available_for_lessons`, `immediately_available_for_review`,
   `levels`, `srs_stages`, `subject_ids`, and `subject_types`.
   [Assignments](https://docs.api.wanikani.com/20170710/#get-all-assignments)
4. `GET /subjects` supplies the meanings, readings, characters, mnemonics, and
   subject relationships needed to turn IDs into study content.
   [Subjects](https://docs.api.wanikani.com/20170710/#get-all-subjects)
5. `GET /review_statistics` supplies answer counts, streaks, and
   `percentage_correct`; server-side filters can bound percentages and subject
   types. This is enough to derive a transparent “problem items” list, although
   “leech” itself is not an official API concept.
   [Review statistics](https://docs.api.wanikani.com/20170710/#get-all-review-statistics)

Recommendation: start with a stateless, read-only stdio server configured by a
single environment variable. It avoids storing a valuable personal token,
avoids inventing a second authentication scheme, and makes the API client and
MCP contracts independently testable. Add writes, persistent caching, remote
HTTP transport, or multi-user support only when a concrete use case requires
them.

## Assessment of `jackedney/wanikani-mcp`

The example is useful as an inventory of possible features, not as a base to
copy wholesale.

Verified positives:

- It uses the correct bearer and revision headers and follows `next_url` for
  pagination in its API client.
  [`wanikani_client.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/wanikani_client.py)
- It separates API access, synchronization, persistence, and MCP registration,
  and uses file logging so stdio protocol traffic is not corrupted.
  [`server.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/server.py)

Material concerns found in the source:

- The architecture is much larger than a single-user local server needs:
  PostgreSQL/SQLModel, Alembic, APScheduler, FastAPI/Uvicorn, a second MCP API
  key, sync logs, and background jobs are all dependencies or moving parts.
  [`pyproject.toml`](https://github.com/jackedney/wanikani-mcp/blob/master/pyproject.toml)
- The README advertises HTTP deployment, but `server.py` explicitly raises
  `NotImplementedError` for HTTP mode. It also describes the project as
  production-ready while its manual sync path contains a TODO that updates only
  the user record.
  [`README.md`](https://github.com/jackedney/wanikani-mcp/blob/master/README.md),
  [`server.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/server.py),
  [`mcp_server.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/mcp_server.py)
- WaniKani personal tokens and generated MCP keys are queried and persisted in
  plaintext. `auth.py` defines `hash_api_key` but registration and verification
  do not use it, contrary to the README's claim that MCP keys are hashed.
  [`auth.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/auth.py)
- The rate limiter is proactive only. The API client calls
  `response.raise_for_status()` and does not use the official rate-limit
  response headers or implement bounded retry behavior for `429`.
  [`wanikani_client.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/wanikani_client.py)
- Tests cover database models and relationships but not the API client,
  pagination, API failures, authentication behavior, or MCP tool contracts.
  [`tests`](https://github.com/jackedney/wanikani-mcp/tree/master/tests)
- Its custom leech rule is `percentage_correct < 70` and total incorrect
  answers `> 3`. That is a product heuristic, not a WaniKani API definition,
  and should be documented as such if adopted.
  [`mcp_server.py`](https://github.com/jackedney/wanikani-mcp/blob/master/src/wanikani_mcp/mcp_server.py)

## Implementation implications

- Keep the personal token in process environment/configuration and redact it
  from errors and logs.
- Centralize request construction and error mapping in one API client.
- Validate all MCP inputs; allow only documented endpoint filters rather than
  exposing arbitrary URLs or query keys.
- Test headers, query serialization, pagination, `429`, malformed/non-JSON
  errors, and MCP success/error results with mocked HTTP responses.
- Return compact, stable MCP payloads. Avoid returning entire subject catalogs
  by default because they are large and consume model context unnecessarily.

