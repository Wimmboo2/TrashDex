# TrashDex

TrashDex identifies one waste item from a photo and returns its item type, material, waste stream, and disposal steps for Indonesia. It does not require an account and does not store the photo.

Live app: [https://trashdex.vercel.app](https://trashdex.vercel.app)

## Why it was built

TrashDex is a school project about household waste sorting in Indonesia. This repository is also the build used for the hackathon submission.

The problem is that "plastic" is not one disposal instruction. A bottle, a sachet, and a cup can go to different places, and the useful routes are split between waste banks (bank sampah), 3R facilities (TPS 3R), scrap collectors (pengepul), and hazardous-waste drop-offs (B3). A wrong guess contaminates the material around it.

The app is built around one item at a time. When the photo is unclear, it says so instead of forcing a confident answer.

## What it does

### Scanner

- Take a photo on a mobile browser or upload a JPEG, PNG, or WebP. Desktop drag and drop works too.
- The browser resizes the image to at most 1600 px on the long edge and re-encodes it as JPEG at quality 0.82 before upload. The file picker accepts up to 12 MB; the server's default limit is 4 MB.
- The server checks the file size, detects the real type from the bytes, parses the JPEG, PNG, or WebP structure, and rejects images that exceed its size or dimension limits.
- Google Gemini classifies the main item into one of 37 fixed item types and 13 material groups, with a high, medium, or low confidence label and up to two alternatives.
- Photos with more than one item, and photos with no clear waste item, are rejected with a specific message. Neither is saved.
- A separate rules engine maps the item and material group to one of 8 waste streams. It returns the stream, disposal steps, warnings, local options (waste bank, 3R facility, B3 drop-off), a scrap-collector note, and a source note.
- An optional School or Neighborhood context adds a short note to the result. It does not change the steps or claim to know local rules.
- After a saved scan, the user can mark the result correct or incorrect. An incorrect result can include a correction: item name, item type, material group, and stream. Only one response is accepted per scan.
- The interface switches between English and Indonesian. The choice is stored in a cookie.

### Public pages

- `/leaderboard` shows all-time most-scanned items and all-time most-confusing items. The confusing view ranks items with at least 5 feedback responses by the share marked incorrect.
- `/insights` shows an all-time summary, a 7-day or 30-day scan chart in Asia/Jakarta, the material mix for that range, the top items in that range, and the all-time confusing-item list. The page states how the numbers are calculated.
- `/slides` is a five-slide pitch deck. It is marked `noindex`.
- The app includes a web app manifest, an SVG icon, and Open Graph/Twitter metadata.

## How it works

### Stack

- Next.js 16 App Router, React 19, TypeScript
- Plain CSS, with Caprasimo and Figtree loaded through `next/font/google`
- Postgres through `pg` (the provided environment file points to Neon)
- Google Gemini through `@google/genai`, using the Interactions API with `store: false` and a JSON response schema. The default model is `gemini-3.5-flash-lite`.
- Zod for API and AI response validation

The model is only asked to identify the item and material. Disposal text always comes from the rules engine, so a model response cannot introduce its own disposal advice.

### Request flow

1. The browser compresses the selected image and sends it as `multipart/form-data` to `POST /api/scan`, with an optional `context` field.
2. The route checks the request origin when `APP_ORIGIN` is set, rejects oversized uploads, validates the image, hashes the client IP, and checks the per-minute, per-day, and global daily scan limits in Postgres.
3. `classifyWasteImage` sends the image and a fixed system prompt to Gemini. The Gemini call times out at 30 seconds, and the browser aborts at 45 seconds.
4. The returned JSON is parsed with Zod. The canonical item must be one of the 37 known types. Malformed JSON or an unknown type returns a 502 error.
5. Multi-item and non-waste results return `scanId: null` and are not written to the database.
6. For a valid item, the route caps `high` confidence to `medium` when the model reports uncertainty or an alternative, then calls the rules engine.
7. `saveScan` inserts the item, material, material group, waste stream, confidence, and timestamp into `scans`. The image is not inserted.
8. If `saveScan` fails, the response still returns the result with `scanId: null`, and the failure is logged. Feedback is unavailable for that scan.
9. Feedback is posted to `/api/feedback` and stored in `scan_feedback`. A unique constraint on `scan_id` makes duplicate feedback return 409.
10. The leaderboard and insights pages run SQL aggregates on the server. The browser does not receive a full scan list to total.

### Database

`db/schema.sql` creates four tables:

- `canonical_items`: the 37 fixed item types and their default streams.
- `scans`: one row per saved scan, with no image data.
- `scan_feedback`: one row per scan, with an optional correction and a `review_status` that defaults to `pending`.
- `rate_limits`: counters keyed by a hashed IP or the global key.

The script seeds the 37 item types and is safe to run again (`create table if not exists` and an upsert on `canonical_items`).

### API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/scan` | Classify one image and save the scan when a waste item is found. |
| `POST` | `/api/feedback` | Save one correct or incorrect response for a scan. |
| `GET` | `/api/leaderboard?view=scanned\|confusing&limit=1..50` | Return ranked items. The default view is `scanned`; the default limit is 20. |
| `GET` | `/api/insights?range=7\|30` | Return the summary, chart, material mix, and rankings. The default range is 7. |

## Run it

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env.local
```

On Windows, use `copy .env.example .env.local`.

| Variable | Required | What it does |
| --- | --- | --- |
| `GEMINI_API_KEY` | Yes for real scans | Server-side key for classification. Without it, `/api/scan` returns 503. |
| `GEMINI_MODEL` | No | Model name. Defaults to `gemini-3.5-flash-lite`. |
| `DATABASE_URL` | Yes for saving and public pages | Postgres connection string. Without it, classification still runs but `scanId` is null; the leaderboard and insights APIs return 503, and the pages show an unavailable state. Use the pooled Neon string in production. |
| `RATE_LIMIT_SECRET` | Yes in production | HMAC key used to hash client IPs. If unset, the code falls back to `trashdex-dev-only-secret`. |
| `APP_ORIGIN` | No | If set, POST requests with a different `Origin` header are rejected. If blank, the check is skipped. |
| `MOCK_AI` | No, test only | `false` or empty turns it off. `true` returns a fixed plastic-bottle result. `not-waste`, `low`, `uncertain`, `multiple`, and `error` exercise the other states. Any other non-empty value behaves like `true`. Never enable it in production. |
| `MAX_IMAGE_BYTES` | No | Server upload limit. Defaults to `4194304`. |
| `SCAN_LIMIT_PER_MINUTE` | No | Defaults to 10. |
| `SCAN_LIMIT_PER_DAY` | No | Defaults to 100. |
| `GLOBAL_SCAN_LIMIT_PER_DAY` | No | Defaults to 500. |
| `FEEDBACK_LIMIT_PER_MINUTE` | No | Defaults to 10. |
| `FEEDBACK_LIMIT_PER_DAY` | No | Defaults to 50. |

For UI work without a Gemini key, set `MOCK_AI=true`. Classification then uses a fixed result and no Gemini request is made.

### 3. Create the schema

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Or paste `db/schema.sql` into the Neon SQL editor. Run it before the first scan.

### 4. Start

```bash
npm run dev
```

Open `http://localhost:3000`.

### Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test:smoke
```

### Tests

`npm run test:smoke` runs `tests/smoke.sh` against `http://127.0.0.1:3000`. It expects a running app with `MOCK_AI=true` and a configured database. It creates a test scan and feedback in that database. It needs `bash`, `curl`, `base64`, `dd`, and `node`; on Windows, run it from Git Bash or WSL.

The optional visual scripts in `tests/` use Playwright. They are not installed by `npm install`; install Playwright separately. They expect the app at `http://127.0.0.1:3000` and write screenshots to `/workspace/shots` by default. Override with `BASE_URL` and `SHOT_DIR`.

## Limitations and design choices

- **General guidance, not local rules.** The rules engine is fixed and covers Indonesia in general. It does not know a city, school, or waste bank's accepted list. The School and Neighborhood options only add a note. The result includes the same caveat.
- **The model can be wrong.** Confidence is a qualitative label, not a probability. A `high` result is downgraded to `medium` if the model reports uncertainty or a close alternative. Multi-item photos are rejected rather than split.
- **Fixed taxonomy.** The model must choose from 37 item types. There is no way to add an item from the UI. Anything that does not fit is mapped to `other` or rejected by validation.
- **No accounts.** Anyone can scan. Feedback is one response per scan and is not tied to a user. Corrections are stored, but they do not rewrite the scan or the rankings.
- **No review workflow.** `scan_feedback.review_status` defaults to `pending`, and nothing in the app changes it. Feedback is reported as unverified.
- **Thresholds.** Reported correctness stays hidden until there are at least 5 feedback responses in total. An item enters the confusing ranking only after 5 responses of its own. The correctness rate uses feedback responses as the denominator, not scans.
- **Diversion is a count, not a weight.** It counts scans in recycling, organic, textile, e-waste, and special drop-off, and excludes residual, hazardous, and unknown scans. It also excludes scans that received an incorrect feedback verdict. One scan counts as one item. It does not prove the item was sorted correctly.
- **All-time vs. window.** The impact summary and the leaderboard are all-time. The insights activity chart, material mix, and top-items list use the selected 7- or 30-day window in Asia/Jakarta; the confusing list is all-time. The totals can differ.
- **Rate limiting fails open.** If the rate-limit query cannot reach Postgres, the request is allowed and marked degraded. If `RATE_LIMIT_SECRET` is unset, IP hashing uses a development secret. The origin check is skipped when `APP_ORIGIN` is blank or the request has no `Origin` header.
- **Persistence is best effort.** A scan can return a result without a `scanId` if the database write fails. That result cannot receive feedback and is not counted in the leaderboard or insights.
- **Image limits.** HEIC is rejected with a message to change the iPhone camera format. The browser compresses to JPEG before upload, and the server applies its own size and dimension limits.
- **Partial Indonesian translation.** The interface copy and most rules text have Indonesian translations. Model-generated text such as the material string is shown as returned, and any rule string without a translation falls back to English.

## Privacy

- Photos are sent to Google Gemini for classification. TrashDex does not store the image.
- Scan metadata is stored without the photo: item name, item type, material, material group, waste stream, confidence, and timestamp.
- Feedback is stored against the scan ID. It has no account or name attached.
- Rate limiting stores an HMAC-SHA256 hash of the client IP, truncated to 32 hex characters. The raw IP is not stored.
- The only cookie is the language preference.
- There are no tracking scripts.

## Deployment

The live app is at [https://trashdex.vercel.app](https://trashdex.vercel.app). Set `GEMINI_API_KEY`, `DATABASE_URL`, `RATE_LIMIT_SECRET`, and `APP_ORIGIN` in the deployment environment, and run `db/schema.sql` against the database before the first scan.
