import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const out = process.env.SHOT_DIR || "/workspace/shots";
const mode = process.env.STATE_NAME || "state";
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

await page.goto(base, { waitUntil: "networkidle" });
await page.locator('input[type="file"]').nth(1).setInputFiles(`${out}/test-bottle.png`);
await page.getByRole("button", { name: "Analyze item" }).click();

if (mode === "not-waste") {
  await page.getByText("No clear waste item found.").waitFor({ timeout: 20000 });
} else if (mode === "error") {
  await page.getByText("That scan did not go through.").waitFor({ timeout: 20000 });
} else if (mode === "low") {
  await page.getByText("Low confidence").waitFor({ timeout: 20000 });
  await page.getByText("Could also be").waitFor({ timeout: 20000 });
} else {
  await page.getByText("Scan result").waitFor({ timeout: 20000 });
}

await page.screenshot({ path: `${out}/scan-${mode}.png`, fullPage: true });
console.log(JSON.stringify({ mode, errors }, null, 2));

await context.close();
await browser.close();
if (errors.length) process.exitCode = 1;
