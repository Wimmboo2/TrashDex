import { query } from "@/lib/db";
import type { Confidence, MaterialGroup, WasteStream } from "@/lib/taxonomy";
import type { LeaderboardItem } from "@/lib/types";

export type SaveScanInput = {
  canonicalItem: string;
  itemName: string;
  material: string;
  materialGroup: MaterialGroup;
  wasteStream: WasteStream;
  confidence: Confidence;
};

export async function saveScan(input: SaveScanInput): Promise<string> {
  const rows = await query<{ id: string }>(
    `insert into scans
      (canonical_item, item_name, material, material_group, waste_stream, confidence)
     values ($1, $2, $3, $4, $5, $6)
     returning id`,
    [
      input.canonicalItem,
      input.itemName,
      input.material,
      input.materialGroup,
      input.wasteStream,
      input.confidence,
    ],
  );

  return rows[0].id;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardItem[]> {
  const rows = await query<{
    canonicalItem: string;
    displayName: string;
    materialGroup: MaterialGroup;
    scanCount: number;
  }>(
    `select
       ci.slug as "canonicalItem",
       ci.display_name as "displayName",
       ci.material_group as "materialGroup",
       count(s.id)::int as "scanCount"
     from canonical_items ci
     join scans s on s.canonical_item = ci.slug
     group by ci.slug, ci.display_name, ci.material_group
     order by count(s.id) desc, ci.display_name asc
     limit $1`,
    [limit],
  );

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export type FeedbackInput = {
  scanId: string;
  verdict: "correct" | "incorrect";
  correctedItemName?: string;
  correctedCanonicalItem?: string;
  correctedMaterialGroup?: MaterialGroup;
  correctedWasteStream?: WasteStream;
};

export type FeedbackOutcome = "created" | "duplicate" | "missing";

export async function saveFeedback(input: FeedbackInput): Promise<FeedbackOutcome> {
  const exists = await query<{ exists: boolean }>(
    "select exists(select 1 from scans where id = $1) as exists",
    [input.scanId],
  );

  if (!exists[0]?.exists) return "missing";

  try {
    const inserted = await query<{ id: string }>(
      `insert into scan_feedback
        (scan_id, verdict, corrected_item_name, corrected_canonical_item,
         corrected_material_group, corrected_waste_stream)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (scan_id) do nothing
       returning id`,
      [
        input.scanId,
        input.verdict,
        input.correctedItemName ?? null,
        input.correctedCanonicalItem ?? null,
        input.correctedMaterialGroup ?? null,
        input.correctedWasteStream ?? null,
      ],
    );

    return inserted.length > 0 ? "created" : "duplicate";
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23503"
    ) {
      return "missing";
    }
    throw error;
  }
}
