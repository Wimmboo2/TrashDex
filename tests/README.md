# Test notes

`tests/smoke.sh` runs against a live local or sandbox server.

It checks:

- Home and leaderboard render
- Leaderboard API returns JSON
- Empty scan, text file, and oversized file are rejected
- A valid PNG is classified with `MOCK_AI=true`, persisted, and returns a scan id
- Feedback is stored, duplicates return 409, and missing scans return 404
- The leaderboard includes the stored scan

The test generates its own tiny PNG and invalid files. No private photos are used.

## Optional visual checks

These require Playwright and a running app. They are not part of the normal `npm install`.

- `tests/visual.mjs` captures desktop and mobile screenshots, runs a scan, and submits feedback.
- `tests/visual-state.mjs` captures the not-a-waste, low-confidence, or upstream-error states. Start the server with `MOCK_AI=not-waste`, `MOCK_AI=low`, or `MOCK_AI=error`, then run `STATE_NAME=<mode> node tests/visual-state.mjs`.
- `tests/visual-correction.mjs` opens the correction form, submits a correction, and captures the success state.

All visual scripts expect the app at `http://127.0.0.1:3000` and write to `/workspace/shots` by default. Override with `BASE_URL` and `SHOT_DIR`.
