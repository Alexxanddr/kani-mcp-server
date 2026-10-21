# Kani MCP Server

<!-- mcp-name: io.github.alexxanddr/kani-mcp-server -->

A small, read-only [Model Context Protocol](https://modelcontextprotocol.io/) server that gives MCP clients access to a user's WaniKani progress and WaniKani reference data through the official API v2.

It can answer questions such as:

- What reviews and lessons are coming up today?
- Which kanji are assigned at a given level?
- Which subjects have the lowest review accuracy?
- What notes or synonyms have I saved?

The server runs locally over stdio. It does not store data, expose an HTTP service, or modify WaniKani.

## Requirements

- Node.js 18 or newer
- A WaniKani personal access token with read-only permissions, created in [WaniKani API Tokens](https://www.wanikani.com/settings/personal_access_tokens)

Keep the token secret. It grants access to account and study data.

## Install

The simplest MCP configuration runs the published package directly with `npx`:

```json
{
  "mcpServers": {
    "wanikani": {
      "command": "npx",
      "args": ["-y", "kani-mcp-server@latest"],
      "env": {
        "WANIKANI_API_TOKEN": "your-read-only-token"
      }
    }
  }
}
```

Alternatively, install the executable globally:

```sh
npm install --global kani-mcp-server
kani-mcp-server
```

Restart the MCP client after changing its configuration. Prefer the client's secure secret facility, when available, over writing a token into a JSON file.

## Run from source

```sh
git clone https://github.com/Alexxanddr/kani-mcp-server.git
cd kani-mcp-server
npm ci
cp .env.example .env
# Edit .env and set WANIKANI_API_TOKEN.
npm run build
node --env-file=.env dist/index.js
```

To configure an MCP client against a source checkout, replace the path and token:

```json
{
  "mcpServers": {
    "wanikani": {
      "command": "node",
      "args": ["/absolute/path/to/kani-mcp-server/dist/index.js"],
      "env": {
        "WANIKANI_API_TOKEN": "your-read-only-token"
      }
    }
  }
}
```

The process communicates via MCP on stdin/stdout, so an empty terminal after startup is normal.

## Tools

| Tool | Purpose |
| --- | --- |
| `get_user` | User profile, level, preferences, and subscription state |
| `get_summary` | Lessons and reviews available during the next 24 hours |
| `list_assignments` | Assignments filtered by subjects, levels, SRS stages, or state |
| `list_subjects` | Radicals, kanji, vocabulary, and kana vocabulary |
| `list_review_statistics` | Accuracy and incorrect-answer totals by subject |
| `list_reviews` | Completed review history |
| `list_study_materials` | Personal notes and meaning/reading synonyms |
| `list_level_progressions` | Level progression history |
| `list_resets` | Account reset history |
| `list_spaced_repetition_systems` | SRS stage definitions |
| `list_voice_actors` | Pronunciation voice actor metadata |
| `get_resource` | One supported resource by type and numeric ID |

Collection tools return one API page. Use `page_after_id` or `page_before_id` from the WaniKani collection pagination data to continue. Arrays are sent as the comma-delimited filters expected by the API.

Example prompts:

```text
Show my WaniKani level and the reviews due in the next 24 hours.
List my level 10 kanji assignments and explain their current SRS stages.
Find review statistics below 70%, then fetch the matching subjects.
```

See [MCP contracts](docs/MCP_CONTRACTS.md) for exact inputs and outputs.

## Configuration

| Variable | Required | Meaning |
| --- | --- | --- |
| `WANIKANI_API_TOKEN` | Yes | Personal WaniKani API v2 bearer token |
| `WANIKANI_API_BASE_URL` | No | API root; defaults to `https://api.wanikani.com/v2` |

Changing the base URL sends the bearer token to that host. Remote overrides must use HTTPS; localhost HTTP is accepted for tests and local development.

## Development

```sh
npm ci
npm run check
npm pack --dry-run
```

- `npm run dev`: run TypeScript directly over stdio
- `npm test`: run unit and MCP contract tests
- `npm run type-check`: check TypeScript without emitting files
- `npm run build`: create the bundled executable in `dist/`

Read [CONTRIBUTING.md](CONTRIBUTING.md), [architecture](docs/ARCHITECTURE.md), and [testing](docs/TESTING.md) before changing public tools.

## Troubleshooting

- **`WANIKANI_API_TOKEN is required`**: pass the variable in the MCP client's `env` block or start Node with `--env-file=.env`.
- **401 Unauthorized**: verify the token and recreate it if it may have been exposed.
- **429 Too Many Requests**: wait for WaniKani's rate-limit reset and request narrower collections.
- **Large responses**: add filters and paginate rather than requesting broad subject or review histories.
- **Client shows disconnected**: use an absolute script path, run `npm run build`, and confirm Node 18+ is on the client's PATH.

## Limitations

- Read-only: starting assignments, submitting reviews, changing user settings, and editing study materials are intentionally absent.
- No automatic multi-page aggregation, caching, resources, or prompts.
- API response objects are passed through unchanged, so upstream additions appear without a package release.

## License and distribution

This project is available under the [MIT License](LICENSE) and is packaged for the public npm registry as `kani-mcp-server`. GitHub releases publish matching package versions through npm Trusted Publishing; see [publishing](docs/PUBLISHING.md) for the one-time setup and release procedure.

WaniKani is a trademark of Tofugu LLC. This independent project is not affiliated with, endorsed by, or sponsored by WaniKani or Tofugu.
