import { copy } from "@/lib/i18n/messages";

/** Streams counted in the rough diversion estimate. Residual, hazardous, and unknown are excluded. */
export const DIVERTABLE_STREAMS = [
  "recycling",
  "organic",
  "textile",
  "electronic",
  "special_dropoff",
] as const;

export const DIVERSION_METHOD = copy.en.insights.diversionMethod;
