import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const out = process.env.SHOT_DIR || "/workspace/shots";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  args: [
    "--no-sandbox",
    "--single-process",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-zygote",
  ],
});

const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

async function shot(name, path, viewport, fullPage = true) {
  await page.setViewportSize(viewport);
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
}

await shot("leaderboard-scanned-desktop", "/leaderboard?view=scanned", {
  width: 1440,
  height: 1000,
});
await shot("leaderboard-confusing-desktop", "/leaderboard?view=confusing", {
  width: 1440,
  height: 1000,
});
await shot("leaderboard-confusing-mobile", "/leaderboard?view=confusing", {
  width: 390,
  height: 844,
});
await shot("insights-7d-desktop", "/insights?range=7", { width: 1440, height: 1000 });
await shot("insights-30d-desktop", "/insights?range=30", { width: 1440, height: 1000 });
await shot("insights-7d-mobile", "/insights?range=7", { width: 390, height: 844 });
await shot("home-desktop", "/", { width: 1440, height: 1000 });

await context.close();
await browser.close();

fs.writeFileSync(`${out}/console-errors.json`, JSON.stringify(errors, null, 2));
console.log(JSON.stringify({ errors, files: fs.readdirSync(out) }, null, 2));
if (errors.length) process.exitCode = 1;
