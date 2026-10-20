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
- Disposal guidance is general Indonesia-oriented guidance, not verified local rules.
- Mock AI modes are test-only: `MOCK_AI=true`, `not-waste`, `low`, `error`. Never enable in production.

## Neon

- Project: `square-flower-66056425`
- Branch: `br-holy-king-az02hsve`
- Database: `neondb`
- Region: Singapore, PostgreSQL 17
- Use the Neon MCP or the Neon console for the connection string. Do not print it.
- The project currently has 37 canonical items and 0 scans.

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

- Stage 1 and Stage 2 are implemented.
- Build, lint, smoke tests, database checks, and browser screenshots passed in DeepInfra Sandbox.
- Real Gemini classification has not been verified because no `GEMINI_API_KEY` was available.
- Nothing is deployed.
- Verification sandboxes have been terminated.
