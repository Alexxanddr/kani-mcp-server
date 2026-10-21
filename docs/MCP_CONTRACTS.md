# MCP contracts

All tools are read-only, idempotent, and open-world. Successful calls contain one text item holding the upstream WaniKani JSON, formatted with two-space indentation. Expected failures return `isError: true` and one safe text message. API response fields follow [WaniKani revision 20170710](https://docs.api.wanikani.com/20170710/).

## Shared collection inputs

Most collection tools accept:

| Input | Type | Constraints |
| --- | --- | --- |
| `ids` | integer array | 1–1000 positive IDs |
| `updated_after` | string | ISO 8601 datetime with an offset |
| `page_after_id` | integer | positive cursor ID |
| `page_before_id` | integer | positive cursor ID |

Only one API page is returned. Inspect `pages.next_url` / `pages.previous_url`, then pass the cursor as `page_after_id` / `page_before_id`. Do not combine opposing cursors.

## Profile and summary

### `get_user`

No input. Calls `GET /user`. Returns the user resource, including level, preferences, and subscription state.

### `get_summary`

No input. Calls `GET /summary`. Returns lessons and reviews available now and during the next 24 hours.

## Collections

### `list_assignments`

Calls `GET /assignments`. In addition to shared inputs, accepts:

- `subject_ids`: 1–1000 positive IDs
- `subject_types`: array of `radical`, `kanji`, `vocabulary`, `kana_vocabulary`
- `levels`: integers 1–60
- `srs_stages`: integers 0–9
- `unlocked`, `started`, `passed`, `burned`, `hidden`: booleans
- `available_after`, `available_before`: ISO 8601 datetimes with offsets
- `immediately_available_for_lessons`, `immediately_available_for_review`: booleans

Example: `{ "levels": [10], "immediately_available_for_review": true }`.

### `list_subjects`

Calls `GET /subjects`. Accepts shared inputs plus `types` (the subject enum above), `slugs` (1–1000 non-empty strings), `levels` (integers 1–60), and `hidden` (boolean). The server fetches the user and rejects explicit levels above `subscription.max_level_granted`; when omitted, it supplies every allowed level.

Example: `{ "levels": [3], "types": ["kanji"] }`.

### `list_review_statistics`

Calls `GET /review_statistics`. Accepts shared inputs plus `subject_ids`, `subject_types`, and integer `percentages_greater_than` / `percentages_less_than` from 0 to 100.

Example: `{ "percentages_less_than": 70, "subject_types": ["kanji"] }`.

### Other collections

These tools accept only the shared collection inputs:

| Tool | Endpoint | Result |
| --- | --- | --- |
| `list_reviews` | `/reviews` | Completed review history |
| `list_study_materials` | `/study_materials` | Notes and synonyms |
| `list_level_progressions` | `/level_progressions` | Level history |
| `list_resets` | `/resets` | Reset history |
| `list_spaced_repetition_systems` | `/spaced_repetition_systems` | SRS definitions |
| `list_voice_actors` | `/voice_actors` | Voice actor metadata |

## Singular resources

### `get_resource`

Inputs:

- `resource` (required): `assignments`, `level_progressions`, `resets`, `reviews`, `review_statistics`, `spaced_repetition_systems`, `study_materials`, `subjects`, or `voice_actors`
- `id` (required): positive integer

Calls `GET /{resource}/{id}`. For subjects, the response is rejected if its level exceeds the user's subscription limit.

Example: `{ "resource": "subjects", "id": 440 }`.

## Errors and compatibility

Invalid input fails before any API call. Upstream errors are reduced to `WaniKani API <status>: <official error>` when a documented `error` string exists; arbitrary response bodies are not forwarded. Invalid/missing subscription metadata also fails closed for subject content.

Tool names, accepted values, defaults, and output semantics are public. Adding optional inputs or upstream response fields is compatible; renaming/removing tools, narrowing inputs, or changing result envelopes requires a breaking release and migration notes.
