/** Streams counted in the rough diversion estimate. Residual, hazardous, and unknown are excluded. */
export const DIVERTABLE_STREAMS = [
  "recycling",
  "organic",
  "textile",
  "electronic",
  "special_dropoff",
] as const;

export const DIVERSION_METHOD =
  "Counts scans classified as recycling, organic, textile, e-waste, or a special drop-off. Residual, hazardous, and unknown results are left out. One scan counts as one item. This is not weighed waste, and it does not mean the item was sorted.";
