# AGENTS.md

## Cursor

This section overrides every section below it.

Mistakes and wrong assumptions from the session that built the ID/EN toggle, Indonesia disposal copy, and the layout-stable toggle. Each one was later caught.

1. `components/insights/ImpactSummary.tsx` imported `DIVERSION_METHOD` from `lib/analytics.ts`. That module imports `pg`, so the client bundle failed with `Can't resolve 'net'` / `tls`. Move `DIVERSION_METHOD` and `DIVERTABLE_STREAMS` to `lib/metrics.ts` and import that from client components. Do not import `lib/analytics.ts` from a client component.

2. Cleaning leftover Indonesian out of `lib/disposal/rules.ts` by replacing tokens produced doubled English: "local environment office office", "the local local environment office", "Waste banks" / "3R facilities" as place titles, a lowercase "hazardous drop-off", a leftover "a B3 or battery", and "clinic, community health clinic". Read the sentences after the replace. English place titles are "Waste bank", "3R facility", and "Hazardous drop-off".

3. A Neon query used `FROM feedback`. The relation does not exist. The table is `scan_feedback`.

4. The video-review subagent rejected `language-toggle-and-nav.mp4` because the file was over 15728640 bytes. Keep a demo under that size, or sample frames with `ffmpeg` instead of sending the raw file.

5. Writing a fixture PNG to `/home/ubuntu/Desktop` failed because that directory did not exist. Create the directory first, or write under `/tmp`.

6. The first `StableText` pass on `components/scanner/FeedbackForm.tsx` used a replace that only hit one error message. The idle-state error was still a raw string. Search for every render of that string after an edit.

7. Layout measurement of `/leaderboard` and `/insights` ran while `app/leaderboard/loading.tsx` and `app/insights/loading.tsx` were still showing skeletons. Those boxes do not change with language, so "no shift" was meaningless. Wait until `.leaderboard-head h1` or `.insights-head h1` (or an `.empty-state` heading) exists. Those pages are slow because they query Neon.

8. Headless Chrome was started without `--user-data-dir`, so the DevTools port never opened, and the failure was hidden because stderr was discarded. Then CDP `WebSocket.send` ran before `open` and threw `DOMException [InvalidStateError]: Sent before connected`. Use `--user-data-dir`, wait for `http://127.0.0.1:<port>/json/version`, and await the socket `open` event before `Runtime.enable`.

9. The scanner card's `y` moved about 2.7px at 1280px and 3.8px at 390px between the English sample and the Indonesian sample. That was the `.scanner-card` `rise` entrance animation, not the language change. A second English sample, taken before switching, already matched Indonesian. Compare two samples in the same language before calling a difference a layout shift. `getBoundingClientRect` includes transforms.

10. `.stable-text.is-block { width: 100% }` plus `.scanner-top > h2 { min-width: 0 }` was the wrong way to reserve wrapping text. A percentage width inside a flex or shrink-to-fit parent makes the intrinsic size circular and can collapse a heading to its longest word. A block grid with `justify-items: stretch` and no `width: 100%` is enough when the parent has a real width. Both rules were removed.

11. `StableText` defaulted `block` text to `align="start"`, which adds `.is-start { justify-items: start }` and beats the stretch that lets paragraphs wrap inside the column. `block` must default to `"stretch"` and add no justify class. Use `align="center"` for pills and nav, `align="end"` for right-aligned counts, and `align="start"` only for inline text that should stay left.

12. A 220ms thumb transition was treated as a snap because a video review and a 2fps frame sample never caught the thumb in the middle. A 30fps crop of the same control showed it mid-slide. The duration is now `320ms` with `cubic-bezier(0.22, 1, 0.36, 1)` on `.lang-toggle-thumb`. Do not trust a sparse frame sample or a video-review claim that contradicts `getBoundingClientRect` and a high-fps crop. `prefers-reduced-motion` still forces `transition-duration: 0.01ms` in `app/globals.css`.

13. After the language work merged, the follow-up was pushed to `cursor/language-toggle-nav-2c3c` and `update_pr` was called for that branch. Pull request #5 was already `MERGED` (`f14c410`). The tool returned `No open PR found for branch: cursor/language-toggle-nav-2c3c`. Check `gh pr view` state before updating. The polish went out as pull request #6, later merged as `44dc0d8`.

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
