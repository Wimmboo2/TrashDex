# TrashDex

TrashDex is a gamified waste scanner built for a school project in Indonesia. Upload or photograph one waste item and get a structured result: item, material, waste stream, confidence, and disposal guidance.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind-free CSS based on the Organic design system (cream, terracotta, sage, Caprasimo, Figtree)
- Google Gemini 3.5 Flash-Lite through the Interactions API
- Neon Postgres for scans, feedback, and the public leaderboard
- Zod validation for API and AI responses

## Features

- Image upload and native mobile camera capture
- Client-side compression before upload
- Server-side file type, size, and magic-byte validation
- Structured Gemini output validated with Zod
- Deterministic disposal rules, separate from the AI
- Confidence and uncertainty states, including a not-a-waste-item state
- Anonymous feedback per scan, stored as unverified
- Public leaderboard with a most-scanned view and a most-confusing view
- Insights dashboard with scan activity, material mix, and reported correctness
- Per-IP rate limits stored in Postgres
- No accounts, no image storage, no tracking scripts

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `GEMINI_API_KEY` for real classification
- `DATABASE_URL` for Neon Postgres
- `RATE_LIMIT_SECRET` with a random 32+ byte value
- `APP_ORIGIN` with the deployed origin

`MOCK_AI` is for local or sandbox UI testing only. Never enable it in production. Supported values: `true` (success result), `not-waste`, `low` (low-confidence composite), and `error` (upstream failure).

## Database

Apply `db/schema.sql` to the Neon database. It creates the tables and seeds the 37 canonical item types.

## Metrics and what they mean

All aggregation happens in SQL on the server. Nothing is calculated in the browser from a full scan list.

| Metric | Definition |
| --- | --- |
| Recorded scans | Every row in `scans`. |
| Item types scanned | Distinct `canonical_item` values in `scans`. |
| Feedback responses | Every row in `scan_feedback`. |
| Reported correctness | Feedback marked correct, out of all feedback. The denominator is feedback, not scans. |
| Reported confusion | Feedback marked incorrect, out of all feedback for that item. |
| Confusing ranking | Items with at least `MIN_FEEDBACK_RESPONSES` (5) feedback responses, ranked by reported confusion. |
| Scan activity | Scans per calendar day in `Asia/Jakarta`, including days with no scans. |
| Material mix | Share of scans per material group inside the selected date range. |

Reported confusion is not a confirmed error rate. Corrections are stored as unverified feedback, and an item below the feedback threshold is never ranked.

## API

- `POST /api/scan` classifies one image and stores the scan.
- `POST /api/feedback` stores one feedback response per scan.
- `GET /api/leaderboard?view=scanned|confusing&limit=20`
- `GET /api/insights?range=7|30`

## Commands

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
npm run test:smoke
```

The smoke test expects a running app at `http://127.0.0.1:3000` and `MOCK_AI=true`.

`tests/visual.mjs` is an optional Playwright screenshot pass. It is not part of `npm install`; install `playwright` separately if you want to run it.

## Privacy

Photos are sent to Google Gemini for analysis and are not stored by TrashDex. On the Gemini free tier, Google may use content to improve its products. Scan metadata is stored without photos. Rate limiting stores an HMAC hash of the client IP, never the raw IP.

## Deployment

- Frontend and API: Vercel, one Next.js project.
- Database: Neon free tier, Singapore region.
- Set `GEMINI_API_KEY`, `DATABASE_URL`, `RATE_LIMIT_SECRET`, and `APP_ORIGIN` in Vercel environment variables.
- Run the database schema once against Neon before the first production scan.
