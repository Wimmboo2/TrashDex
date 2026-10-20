function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const rawMockAi = (process.env.MOCK_AI || "").trim().toLowerCase();

export const config = {
  geminiModel: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  maxImageBytes: positiveInt(process.env.MAX_IMAGE_BYTES, 4 * 1024 * 1024),
  scanPerMinute: positiveInt(process.env.SCAN_LIMIT_PER_MINUTE, 10),
  scanPerDay: positiveInt(process.env.SCAN_LIMIT_PER_DAY, 100),
  globalScanPerDay: positiveInt(process.env.GLOBAL_SCAN_LIMIT_PER_DAY, 500),
  feedbackPerMinute: positiveInt(process.env.FEEDBACK_LIMIT_PER_MINUTE, 10),
  feedbackPerDay: positiveInt(process.env.FEEDBACK_LIMIT_PER_DAY, 50),
  appOrigin: process.env.APP_ORIGIN || "",
  mockAiMode: rawMockAi === "" || rawMockAi === "false" ? "" : rawMockAi,
};
