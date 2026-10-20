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

const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const page = await context.newPage();
const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
});
page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));

await page.goto(base, { waitUntil: "networkidle" });
await page.locator('input[type="file"]').nth(1).setInputFiles(`${out}/test-bottle.png`);
await page.getByRole("button", { name: "Analyze item" }).click();
await page.getByText("Scan result").waitFor({ timeout: 20000 });
await page.getByRole("button", { name: "No, something is off" }).click();
await page.getByText("Correct item name (optional)").waitFor({ timeout: 10000 });
await page.screenshot({ path: `${out}/scan-correction-desktop.png`, fullPage: true });

await page.locator("#correction-item").fill("Glass jar");
await page.locator("#correction-canonical").selectOption("glass-jar");
await page.locator("#correction-material").selectOption("glass");
await page.locator("#correction-stream").selectOption("recycling");
await page.getByRole("button", { name: "Send correction" }).click();
await page.getByText("Thanks. Your feedback was recorded.").waitFor({ timeout: 10000 });
await page.screenshot({ path: `${out}/scan-correction-success-desktop.png`, fullPage: true });

console.log(JSON.stringify({ errors }, null, 2));

await context.close();
await browser.close();
if (errors.length) process.exitCode = 1;
