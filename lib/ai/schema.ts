import { z } from "zod";
import {
  CANONICAL_ITEM_SLUGS,
  CANONICAL_ITEM_SLUG_SET,
  CONFIDENCE_LEVELS,
  MATERIAL_GROUPS,
} from "@/lib/taxonomy";
import { AppError } from "@/lib/errors";

const canonicalItemSchema = z
  .string()
  .min(1)
  .refine((value) => CANONICAL_ITEM_SLUG_SET.has(value), "Unknown canonical item");

export const AiClassificationSchema = z
  .object({
    isWasteItem: z.boolean(),
    itemName: z.string().min(1).max(80),
    canonicalItem: canonicalItemSchema,
    material: z.string().min(1).max(80),
    materialGroup: z.enum(MATERIAL_GROUPS),
    confidence: z.enum(CONFIDENCE_LEVELS),
    uncertaintyReason: z.string().max(240),
    alternatives: z
      .array(
        z
          .object({
            itemName: z.string().min(1).max(80),
            canonicalItem: canonicalItemSchema,
            materialGroup: z.enum(MATERIAL_GROUPS),
          })
          .strict(),
      )
      .max(2),
  })
  .strict();

export type AiClassification = z.infer<typeof AiClassificationSchema>;

export const AI_JSON_SCHEMA = {
  type: "object",
  properties: {
    isWasteItem: {
      type: "boolean",
      description: "True only when the image contains a waste item.",
    },
    itemName: {
      type: "string",
      description: "A short, specific name for the main object.",
    },
    canonicalItem: {
      type: "string",
      enum: CANONICAL_ITEM_SLUGS,
      description: "The closest allowed canonical item.",
    },
    material: {
      type: "string",
      description: "The likely material, for example PET plastic (#1).",
    },
    materialGroup: {
      type: "string",
      enum: MATERIAL_GROUPS,
      description: "The broad material family.",
    },
    confidence: {
      type: "string",
      enum: CONFIDENCE_LEVELS,
      description: "Qualitative certainty, not a probability.",
    },
    uncertaintyReason: {
      type: "string",
      description: "Why the result is uncertain. Empty when there is no concern.",
    },
    alternatives: {
      type: "array",
      maxItems: 2,
      description: "Up to two other plausible item types.",
      items: {
        type: "object",
        properties: {
          itemName: { type: "string" },
          canonicalItem: { type: "string", enum: CANONICAL_ITEM_SLUGS },
          materialGroup: { type: "string", enum: MATERIAL_GROUPS },
        },
        required: ["itemName", "canonicalItem", "materialGroup"],
      },
    },
  },
  required: [
    "isWasteItem",
    "itemName",
    "canonicalItem",
    "material",
    "materialGroup",
    "confidence",
    "uncertaintyReason",
    "alternatives",
  ],
} as const;

export function parseAiClassification(text: string): AiClassification {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new AppError(
      "INVALID_AI_RESPONSE",
      502,
      "The scanner returned an unreadable result. Try again.",
    );
  }

  const parsed = AiClassificationSchema.safeParse(json);
  if (!parsed.success) {
    throw new AppError(
      "INVALID_AI_RESPONSE",
      502,
      "The scanner returned an unreadable result. Try again.",
    );
  }

  return parsed.data;
}
