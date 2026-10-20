import { GoogleGenAI } from "@google/genai";
import { AI_JSON_SCHEMA, parseAiClassification, type AiClassification } from "@/lib/ai/schema";
import { SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { config } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { logError } from "@/lib/logger";

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      "AI_NOT_CONFIGURED",
      503,
      "The scanner is not configured yet. Add a Gemini API key on the server.",
    );
  }

  if (!client) {
    client = new GoogleGenAI({
      apiKey,
      httpOptions: { timeout: 30000 },
    });
  }

  return client;
}

function mockClassification(): AiClassification {
  const mode = config.mockAiMode;

  if (mode === "not-waste") {
    return {
      isWasteItem: false,
      itemName: "Houseplant",
      canonicalItem: "other",
      material: "Organic matter",
      materialGroup: "organic",
      confidence: "low",
      uncertaintyReason: "No waste item detected.",
      alternatives: [],
    };
  }

  if (mode === "low") {
    return {
      isWasteItem: true,
      itemName: "Composite coffee cup",
      canonicalItem: "composite-packaging",
      material: "Paper with a plastic lining",
      materialGroup: "composite",
      confidence: "low",
      uncertaintyReason:
        "The cup has a mixed material lining, so the correct stream is unclear.",
      alternatives: [
        {
          itemName: "Paper cup",
          canonicalItem: "paper-cup",
          materialGroup: "paper",
        },
      ],
    };
  }

  return {
    isWasteItem: true,
    itemName: "Plastic water bottle",
    canonicalItem: "plastic-bottle",
    material: "PET plastic (#1)",
    materialGroup: "plastic",
    confidence: "high",
    uncertaintyReason: "",
    alternatives: [],
  };
}

function statusOf(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const value = error as {
    status?: unknown;
    code?: unknown;
    response?: { status?: unknown };
  };
  if (typeof value.status === "number") return value.status;
  if (typeof value.code === "number") return value.code;
  if (value.response && typeof value.response.status === "number") return value.response.status;
  return undefined;
}

function isTimeout(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const value = error as { name?: unknown; message?: unknown };
  return (
    value.name === "AbortError" ||
    (typeof value.message === "string" && value.message.toLowerCase().includes("timeout"))
  );
}

export async function classifyWasteImage(input: {
  buffer: Buffer;
  mimeType: string;
}): Promise<AiClassification> {
  if (config.mockAiMode) {
    await new Promise((resolve) => setTimeout(resolve, 900));

    if (config.mockAiMode === "error") {
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        503,
        "The scanner is temporarily unavailable. Try again shortly.",
      );
    }

    return mockClassification();
  }

  try {
    const interaction = await getClient().interactions.create({
      model: config.geminiModel,
      store: false,
      system_instruction: SYSTEM_PROMPT,
      input: [
        { type: "text", text: "Identify the main object in this image." },
        {
          type: "image",
          data: input.buffer.toString("base64"),
          mime_type: input.mimeType,
        },
      ],
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: AI_JSON_SCHEMA,
      },
      generation_config: {
        thinking_level: "minimal",
        temperature: 0.1,
        max_output_tokens: 1024,
      },
    });

    const text = interaction.output_text;
    if (!text) {
      throw new AppError(
        "INVALID_AI_RESPONSE",
        502,
        "The scanner returned an empty result. Try again.",
      );
    }

    return parseAiClassification(text);
  } catch (error) {
    if (error instanceof AppError) throw error;

    const status = statusOf(error);
    logError("gemini_request_failed", {
      status: status ?? "unknown",
      name: typeof error === "object" && error !== null && "name" in error ? String(error.name) : "unknown",
    });

    if (isTimeout(error)) {
      throw new AppError(
        "UPSTREAM_TIMEOUT",
        504,
        "The scan took too long. Try a smaller or clearer photo.",
      );
    }

    if (status === 429) {
      throw new AppError(
        "UPSTREAM_QUOTA",
        429,
        "The scanner is at its limit right now. Try again in a minute.",
        60,
      );
    }

    if (status === 400 || status === 404) {
      throw new AppError(
        "INVALID_AI_RESPONSE",
        502,
        "The scanner could not read that image. Try another photo.",
      );
    }

    if (status && status >= 500) {
      throw new AppError(
        "UPSTREAM_UNAVAILABLE",
        503,
        "The scanner is temporarily unavailable. Try again shortly.",
      );
    }

    throw new AppError(
      "UPSTREAM_UNAVAILABLE",
      503,
      "The scanner is temporarily unavailable. Try again shortly.",
    );
  }
}
