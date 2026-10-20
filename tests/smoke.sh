#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-http://127.0.0.1:3000}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="${TMPDIR:-/tmp}/trashdex-smoke"
mkdir -p "$TMP"

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; exit 1; }

status() {
  curl -s -o "$TMP/body.json" -w "%{http_code}" "$@"
}

# A tiny valid PNG, generated locally so no fixture binary is required.
printf '%s' 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=' | base64 -d > "$TMP/tiny.png"
printf 'not an image' > "$TMP/not-an-image.txt"
dd if=/dev/zero of="$TMP/too-large.jpg" bs=1M count=5 status=none

code=$(status "$BASE/")
[ "$code" = "200" ] || fail "home returned $code"
grep -q "TrashDex" "$TMP/body.json" || fail "home does not contain TrashDex"
pass "home renders"

code=$(status "$BASE/leaderboard")
[ "$code" = "200" ] || fail "leaderboard returned $code"
pass "leaderboard renders"

code=$(status "$BASE/api/leaderboard")
[ "$code" = "200" ] || fail "leaderboard api returned $code"
grep -q '"items"' "$TMP/body.json" || fail "leaderboard api missing items"
pass "leaderboard api responds"

code=$(status "$BASE/api/leaderboard?view=confusing")
[ "$code" = "200" ] || fail "confusing leaderboard api returned $code"
grep -q '"view":"confusing"' "$TMP/body.json" || fail "confusing leaderboard api missing view"
grep -q '"minFeedback"' "$TMP/body.json" || fail "confusing leaderboard api missing minFeedback"
pass "confusing leaderboard api responds"

code=$(status "$BASE/leaderboard?view=confusing")
[ "$code" = "200" ] || fail "confusing leaderboard page returned $code"
grep -q "Most confusing items" "$TMP/body.json" || fail "confusing leaderboard page missing heading"
pass "confusing leaderboard page renders"

code=$(status "$BASE/api/insights")
[ "$code" = "200" ] || fail "insights api returned $code"
grep -q '"overview"' "$TMP/body.json" || fail "insights api missing overview"
grep -q '"dailyScans"' "$TMP/body.json" || fail "insights api missing dailyScans"
grep -q '"reportedCorrectnessRate"' "$TMP/body.json" || fail "insights api missing correctness rate"
pass "insights api responds"

code=$(status "$BASE/insights?range=30")
[ "$code" = "200" ] || fail "insights page returned $code"
grep -q "What the scans say" "$TMP/body.json" || fail "insights page missing heading"
pass "insights page renders"

code=$(status -X POST "$BASE/api/scan")
[ "$code" = "400" ] || fail "empty scan returned $code"
pass "empty scan rejected"

code=$(status -X POST -F "image=@$TMP/not-an-image.txt;type=text/plain" "$BASE/api/scan")
[ "$code" = "415" ] || fail "text file returned $code"
pass "invalid file type rejected"

code=$(status -X POST -F "image=@$TMP/too-large.jpg;type=image/jpeg" "$BASE/api/scan")
[ "$code" = "413" ] || fail "oversized file returned $code"
pass "oversized file rejected"

code=$(status -X POST -F "image=@$TMP/tiny.png;type=image/png" "$BASE/api/scan")
[ "$code" = "200" ] || fail "valid scan returned $code"
node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); if(!d.scanId) process.exit(2); if(!d.result || d.result.isWasteItem!==true) process.exit(3);' "$TMP/body.json" || fail "valid scan response shape"
SCAN_ID=$(node -e 'const fs=require("fs"); const d=JSON.parse(fs.readFileSync(process.argv[1],"utf8")); process.stdout.write(d.scanId);' "$TMP/body.json")
pass "valid scan persists and returns scanId"

code=$(status -X POST -H "Content-Type: application/json" -d "{\"scanId\":\"$SCAN_ID\",\"verdict\":\"correct\"}" "$BASE/api/feedback")
[ "$code" = "201" ] || fail "feedback returned $code"
pass "feedback stored"

code=$(status -X POST -H "Content-Type: application/json" -d "{\"scanId\":\"$SCAN_ID\",\"verdict\":\"correct\"}" "$BASE/api/feedback")
[ "$code" = "409" ] || fail "duplicate feedback returned $code"
pass "duplicate feedback rejected"

code=$(status -X POST -H "Content-Type: application/json" -d '{"scanId":"00000000-0000-4000-8000-000000000000","verdict":"correct"}' "$BASE/api/feedback")
[ "$code" = "404" ] || fail "missing scan feedback returned $code"
pass "missing scan feedback rejected"

code=$(status "$BASE/api/leaderboard")
[ "$code" = "200" ] || fail "leaderboard api after scan returned $code"
grep -q '"scanCount"' "$TMP/body.json" || fail "leaderboard missing scanCount"
grep -q '"share"' "$TMP/body.json" || fail "leaderboard missing share"
pass "leaderboard includes stored scan"

echo "All smoke tests passed."
