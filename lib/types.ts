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
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};
