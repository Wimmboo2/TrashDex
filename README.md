# TrashDex

Live app: [https://trashdex.vercel.app](https://trashdex.vercel.app)

TrashDex helps people in Indonesia sort one waste item at a time. A photo comes back as an item, a material, a waste stream, and practical disposal steps.

## Problem

Wrong sorting contaminates everything around it. A battery in a household sack, a food-stained box in a paper bundle, or a mixed photo guessed as one confident item sends recoverable material the wrong way. In Indonesia the useful next step is often a bank sampah, a TPS 3R, a scrap collector, or a B3 drop-off, and those options are easy to mix up.

## How it works

1. Photograph one item, or upload a JPEG, PNG, or WebP.
2. Google Gemini returns a structured guess: item, material, confidence, and whether the photo shows more than one item. The model does not write disposal advice.
3. A fixed rules engine maps that item to a waste stream and to Indonesia guidance: steps, bank sampah, TPS 3R, B3 drop-off, and whether scrap collectors commonly buy it.
4. The person can mark the result right or wrong. Feedback is anonymous and stored as unverified.
5. The leaderboard and insights pages aggregate those rows in SQL. The browser never totals a downloaded scan list.

## Impact, and how success would be measured

The point is fewer confidently wrong sorts, and a public view of what people are scanning.

Success shows up as:

- More items scanned, counted as stored scans.
- Reported correctness, shown only after at least 5 feedback responses. The rate is correct responses divided by all feedback, not by scans.
- Confusing-item rankings, shown only for an item with at least 5 feedback responses of its own.
- A rough diversion estimate: scans classified as recycling, organic, textile, e-waste, or a special drop-off, out of all scans. Residual, hazardous, and unknown results are left out. One scan counts as one item. This is not weighed waste, and it does not mean the item was sorted.

The insights page states that method next to the number.

## Main flow

Open the scanner, take or upload a photo of one item, and read the result. A clear photo shows the item, material, confidence, stream, disposal steps, places in Indonesia, and a scrap-collector note. The page says the guidance is for Indonesia and that local rules still apply. Mark the result right or wrong, then open the leaderboard for all-time rankings or Insights for the all-time summary and the 7-day or 30-day chart.

## Limitations

- Disposal text is general guidance for Indonesia. It is not a city regulation, a school policy, or a promise that a nearby bank sampah or TPS 3R accepts the item.
- The model can be wrong. Confidence is a qualitative label, not a measured probability. Multi-item photos are rejected instead of guessed.
- Photos are sent to Google Gemini and are not stored by TrashDex. On the Gemini free tier, Google may use content to improve its products.
- There are no accounts. Feedback is one response per scan, and a correction does not rewrite scan history.
- Reported correctness and confusing rankings stay hidden until the feedback threshold. A handful of responses is not treated as a rate.
- The diversion figure is a classification count. It is not kilograms, and it is not evidence of behavior change.
- Rankings and the impact summary are all time. The activity chart is only the last 7 or 30 days in Asia/Jakarta, so those totals can differ.

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
- Deterministic Indonesia disposal rules, separate from the AI
- Confidence and uncertainty states, including a not-a-waste-item state and a multi-item state
- Anonymous feedback per scan, stored as unverified
- Public leaderboard with a most-scanned view and a most-confusing view
- Insights dashboard with an all-time impact summary, a dated activity chart, material mix, and reported correctness
- Web app manifest and social preview tags
- Per-IP rate limits stored in Postgres
- No accounts, no image storage, no tracking scripts

## Environment

Copy `.env.example` to `.env.local` and fill in:

- `GEMINI_API_KEY` for real classification
- `DATABASE_URL` for Neon Postgres
- `RATE_LIMIT_SECRET` with a random 32+ byte value
- `APP_ORIGIN` with the deployed origin

`MOCK_AI` is for local or sandbox UI testing only. Never enable it in production. Supported values: `true` (success result), `not-waste`, `low` (low-confidence composite), `uncertain`, `multiple`, and `error` (upstream failure).

## Database

Apply `db/schema.sql` to the Neon database. It creates the tables and seeds the 37 canonical item types.

## Metrics and what they mean

All aggregation happens in SQL on the server. Nothing is calculated in the browser from a full scan list.

| Metric | Definition |
| --- | --- |
| Items scanned | Every row in `scans`. All time. |
| Item types | Distinct `canonical_item` values in `scans`. All time. |
| Feedback responses | Every row in `scan_feedback`. |
| Reported correctness | Correct feedback divided by all feedback. Hidden until there are at least `MIN_FEEDBACK_RESPONSES` (5) responses. The denominator is feedback, not scans. |
| Reported confusion | Feedback marked incorrect, out of all feedback for that item. |
| Confusing ranking | Items with at least 5 feedback responses, ranked by reported confusion. |
| Rough diversion | Scans whose stream is recycling, organic, textile, e-waste, or special drop-off. Residual, hazardous, and unknown are excluded. |
| Scan activity | Scans per calendar day in `Asia/Jakarta` for the last 7 or 30 days, including days with no scans. This window can be smaller than the all-time total. |
| Material mix | Share of scans per material group inside the selected date range. |

Reported confusion is not a confirmed error rate. Corrections are stored as unverified feedback.

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

- Live site: [https://trashdex.vercel.app](https://trashdex.vercel.app)
- Frontend and API: Vercel, one Next.js project.
- Database: Neon, Singapore region.
- Set `GEMINI_API_KEY`, `DATABASE_URL`, `RATE_LIMIT_SECRET`, and `APP_ORIGIN` in Vercel environment variables.
- Run the database schema once against Neon before the first production scan.
