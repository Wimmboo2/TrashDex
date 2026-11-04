# AGENTS.md

## User rules

1. Never install packages, dependencies, SDKs, CLIs, browser extensions, or system software without asking first and receiving explicit approval.
2. If requirements are unclear, ask questions instead of guessing.
3. If documentation or behavior is uncertain, check official documentation or reputable sources instead of inventing an answer.
4. Verify code by reading and reasoning unless explicitly told to run it, start localhost, build, test, or execute commands.
5. Before large or destructive changes (many files, deletions, refactors, configuration changes), explain the plan and wait for approval.
6. Modify only what is necessary. Do not rewrite working code unless asked for a refactor.
7. Never access, modify, or delete files outside this project unless explicitly asked.
8. Tell the user exactly what changed after every completed task.

## Sandbox exception

The user has explicitly allowed installs, builds, tests, browser automation, and command execution inside DeepInfra Sandbox. That permission does not extend to the local machine. Ask before installing or running anything locally.

## Secret handling

- Never print environment variable values, API keys, connection strings, or passwords.
- Check that a secret exists without echoing it.
- Keep secrets in `.env.local` or the hosting provider's environment settings. Never commit them.
- If a secret is exposed in a transcript or log, tell the user to rotate it immediately.

## Project context

- TrashDex is a Next.js 16 App Router project with React 19 and TypeScript.
- Styling is plain CSS based on the Organic design system. No Tailwind.
- The scanner uses Google Gemini `gemini-3.5-flash-lite` through the Interactions API.
- The database is Neon Postgres. Schema and seed live in `db/schema.sql`.
- The app uses `pg` with raw SQL, not an ORM.
- No accounts, no image storage, no tracking scripts.
- Disposal guidance is deterministic and Indonesia-oriented: bank sampah, TPS 3R, B3 drop-offs, and scrap collectors. It is not a verified city or school rule.
- Live site: https://trashdex.vercel.app
- Mock AI modes are test-only: `MOCK_AI=true`, `not-waste`, `low`, `uncertain`, `multiple`, `error`. Never enable in production.
- Scope: scanner, feedback, leaderboard, and insights. Do not add gamification, accounts, browser-local progress, or third-party services.

## Metrics

- Queries live in `lib/analytics.ts`. Aggregation stays in SQL.
- The impact summary is all time. The activity chart, material mix, and in-range top items are the selected 7- or 30-day window in `Asia/Jakarta`. Those totals are allowed to differ.
- Reported correctness uses feedback as the denominator, never scans, and stays hidden until `MIN_FEEDBACK_RESPONSES` (5) responses.
- A confusing-item ranking needs at least `MIN_FEEDBACK_RESPONSES` (5) feedback responses per item.
- The rough diversion estimate counts scans in recycling, organic, textile, e-waste, or special drop-off. It is not weighed waste.
- Daily buckets use `Asia/Jakarta`.
- Never seed or fabricate production data to make a view look populated.

## Neon

- Project: `square-flower-66056425`
- Branch: `br-holy-king-az02hsve`
- Database: `neondb`
- Region: Singapore, PostgreSQL 17
- Use the Neon MCP or the Neon console for the connection string. Do not print it.
- Canonical items are seeded. Scan and feedback counts change. Query them. Do not assume the database is empty.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run test:smoke
```

`tests/smoke.sh` expects a running app at `http://127.0.0.1:3000` with `MOCK_AI=true`.

Optional Playwright checks:

```bash
node tests/visual.mjs
STATE_NAME=not-waste node tests/visual-state.mjs
node tests/visual-correction.mjs
```

These require Playwright and a running app. They write screenshots to `artifacts/` by default.

## Current status

- Stage 1, Stage 2, and Stage 3 are implemented.
- The app is deployed at https://trashdex.vercel.app.
- Do not assume a live Gemini classification has been verified in the current environment.
- Scan and feedback rows exist. Read counts from the database instead of hard-coding them.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
