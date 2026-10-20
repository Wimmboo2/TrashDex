import { z } from "zod";
import {
  CANONICAL_ITEM_SLUG_SET,
  MATERIAL_GROUPS,
  WASTE_STREAMS,
} from "@/lib/taxonomy";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const optionalText = z
  .string()
  .trim()
  .max(80)
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalCanonicalItem = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine((value) => value === undefined || CANONICAL_ITEM_SLUG_SET.has(value), {
    message: "Unknown canonical item",
  });

export const FeedbackSchema = z
  .object({
    scanId: z.string().regex(uuidPattern, "Invalid scan id"),
    verdict: z.enum(["correct", "incorrect"]),
    correction: z
      .object({
        itemName: optionalText,
        canonicalItem: optionalCanonicalItem,
        materialGroup: z.enum(MATERIAL_GROUPS).optional(),
        wasteStream: z.enum(WASTE_STREAMS).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export type FeedbackPayload = z.infer<typeof FeedbackSchema>;
