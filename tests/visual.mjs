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

const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const errors = [];

page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

async function capture(name, viewport, path, fullPage = false) {
  await page.setViewportSize(viewport);
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${out}/${name}.png`, fullPage });
}

await capture("home-desktop", { width: 1440, height: 1000 }, "/");
await capture("home-mobile", { width: 390, height: 844 }, "/", true);
await capture("leaderboard-desktop", { width: 1440, height: 1000 }, "/leaderboard");
await capture("leaderboard-mobile", { width: 390, height: 844 }, "/leaderboard", true);

await page.setViewportSize({ width: 640, height: 640 });
await page.setContent(`<!doctype html><html><body style="margin:0;background:#f5ead8;display:grid;place-items:center;height:100vh">
<div style="width:220px;height:420px;background:linear-gradient(90deg,#bfe3ea,#e8f8fa 45%,#9fd3dd);border-radius:80px 80px 28px 28px;position:relative;box-shadow:0 20px 40px rgba(0,0,0,.18)">
<div style="position:absolute;top:-52px;left:78px;width:64px;height:70px;background:#2f6f78;border-radius:14px 14px 8px 8px"></div>
<div style="position:absolute;top:190px;left:0;right:0;height:86px;background:rgba(255,255,255,.55)"></div>
<div style="position:absolute;top:215px;left:38px;font:700 22px sans-serif;color:#24545b;letter-spacing:.08em">WATER</div>
</div></body></html>`);
await page.screenshot({ path: `${out}/test-bottle.png` });

async function scanFlow(name, viewport) {
  await page.setViewportSize(viewport);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').nth(1).setInputFiles(`${out}/test-bottle.png`);
  await page.getByRole("button", { name: "Analyze item" }).click();
  await page.getByText("Scan result").waitFor({ timeout: 20000 });
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
}

await scanFlow("scan-result-desktop", { width: 1440, height: 1100 });
await page.getByRole("button", { name: "Yes, it is right" }).click();
await page.getByText("Thanks. Your feedback was recorded.").waitFor({ timeout: 10000 });
await page.screenshot({ path: `${out}/scan-feedback-desktop.png`, fullPage: true });

await scanFlow("scan-result-mobile", { width: 390, height: 844 });

await context.close();
await browser.close();

fs.writeFileSync(`${out}/console-errors.json`, JSON.stringify(errors, null, 2));
console.log(JSON.stringify({ errors, files: fs.readdirSync(out) }, null, 2));
if (errors.length) process.exitCode = 1;
