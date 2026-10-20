import type { Confidence, MaterialGroup, WasteStream } from "./taxonomy";

export type DisposalGuidance = {
  wasteStream: WasteStream;
  headline: string;
  steps: string[];
  warnings: string[];
  scope: "general" | "local";
  sourceNote: string;
};

export type ScanAlternative = {
  itemName: string;
  canonicalItem: string;
  canonicalItemLabel: string;
};

export type WasteResult = {
  isWasteItem: true;
  itemName: string;
  canonicalItem: string;
  canonicalItemLabel: string;
  material: string;
  materialGroup: MaterialGroup;
  wasteStream: WasteStream;
  confidence: Confidence;
  uncertaintyReason: string;
  alternatives: ScanAlternative[];
  disposal: DisposalGuidance;
};

export type NotWasteResult = {
  isWasteItem: false;
  itemName: string;
  message: string;
};

export type ScanResultPayload = {
  scanId: string | null;
  result: WasteResult | NotWasteResult;
};

export type LeaderboardItem = {
  rank: number;
  canonicalItem: string;
  displayName: string;
  materialGroup: MaterialGroup;
  scanCount: number;
  /** Share of all recorded scans, 0 to 1. */
  share: number;
};

export type ConfusingItem = {
  rank: number;
  canonicalItem: string;
  displayName: string;
  materialGroup: MaterialGroup;
  /** Feedback responses received for this item. */
  feedbackCount: number;
  /** Feedback responses marked as incorrect for this item. */
  negativeCount: number;
  /** Share of this item's feedback responses marked incorrect, 0 to 1. */
  negativeRate: number;
};

export type DailyScanPoint = {
  /** Calendar date in the reporting time zone, YYYY-MM-DD. */
  date: string;
  scanCount: number;
};

export type MaterialBreakdownItem = {
  materialGroup: MaterialGroup;
  scanCount: number;
  /** Share of scans inside the selected range, 0 to 1. */
  share: number;
};

export type Overview = {
  totalScans: number;
  uniqueItems: number;
  feedbackCount: number;
  correctFeedbackCount: number;
  incorrectFeedbackCount: number;
  /** Correct feedback over all feedback, 0 to 1. Null when there is no feedback. */
  reportedCorrectnessRate: number | null;
};

export type InsightsData = {
  range: 7 | 30;
  minFeedback: number;
  overview: Overview;
  topItems: LeaderboardItem[];
  confusingItems: ConfusingItem[];
  dailyScans: DailyScanPoint[];
  materialBreakdown: MaterialBreakdownItem[];
  generatedAt: string;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};
