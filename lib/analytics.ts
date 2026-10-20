import { query } from "@/lib/db";
import type {
  ConfusingItem,
  DailyScanPoint,
  InsightsData,
  LeaderboardItem,
  MaterialBreakdownItem,
  Overview,
} from "@/lib/types";
import type { MaterialGroup } from "@/lib/taxonomy";

export const ANALYTICS_RANGES = [7, 30] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = 7;

/**
 * An item needs this many feedback responses before it can be ranked as
 * confusing. Below the threshold the sample is too small to say anything.
 */
export const MIN_FEEDBACK_RESPONSES = 5;

/** Daily buckets are grouped by local school time, not UTC. */
export const REPORTING_TIME_ZONE = "Asia/Jakarta";

export function parseAnalyticsRange(value: string | null | undefined): AnalyticsRange {
  const parsed = Number(value);
  return ANALYTICS_RANGES.includes(parsed as AnalyticsRange)
    ? (parsed as AnalyticsRange)
    : DEFAULT_ANALYTICS_RANGE;
}

export async function getOverview(): Promise<Overview> {
  const rows = await query<{
    totalScans: number;
    uniqueItems: number;
    feedbackCount: number;
    correctFeedbackCount: number;
    incorrectFeedbackCount: number;
  }>(
    `select
       (select count(*)::int from scans) as "totalScans",
       (select count(distinct canonical_item)::int from scans) as "uniqueItems",
       (select count(*)::int from scan_feedback) as "feedbackCount",
       (select count(*)::int from scan_feedback where verdict = 'correct') as "correctFeedbackCount",
       (select count(*)::int from scan_feedback where verdict = 'incorrect') as "incorrectFeedbackCount"`,
  );

  const row = rows[0];
  const feedbackCount = row?.feedbackCount ?? 0;
  const correctFeedbackCount = row?.correctFeedbackCount ?? 0;

  return {
    totalScans: row?.totalScans ?? 0,
    uniqueItems: row?.uniqueItems ?? 0,
    feedbackCount,
    correctFeedbackCount,
    incorrectFeedbackCount: row?.incorrectFeedbackCount ?? 0,
    reportedCorrectnessRate:
      feedbackCount > 0 ? correctFeedbackCount / feedbackCount : null,
  };
}

/**
 * Items ranked by the share of their feedback responses that were marked
 * incorrect. This is reported confusion, not verified model error, so the
 * minimum response threshold applies.
 */
export async function getConfusingItems(
  options: { minFeedback?: number; limit?: number } = {},
): Promise<ConfusingItem[]> {
  const minFeedback = options.minFeedback ?? MIN_FEEDBACK_RESPONSES;
  const limit = options.limit ?? 20;

  const rows = await query<{
    canonicalItem: string;
    displayName: string;
    materialGroup: MaterialGroup;
    feedbackCount: number;
    negativeCount: number;
    negativeRate: number;
  }>(
    `with feedback_by_item as (
       select s.canonical_item as canonical_item,
              count(*)::int as feedback_count,
              count(*) filter (where f.verdict = 'incorrect')::int as negative_count
       from scan_feedback f
       join scans s on s.id = f.scan_id
       group by s.canonical_item
     )
     select ci.slug as "canonicalItem",
            ci.display_name as "displayName",
            ci.material_group as "materialGroup",
            fb.feedback_count as "feedbackCount",
            fb.negative_count as "negativeCount",
            (fb.negative_count::float8 / fb.feedback_count) as "negativeRate"
     from feedback_by_item fb
     join canonical_items ci on ci.slug = fb.canonical_item
     where fb.feedback_count >= $1
     order by (fb.negative_count::float8 / fb.feedback_count) desc,
              fb.negative_count desc,
              ci.display_name asc
     limit $2::int`,
    [minFeedback, limit],
  );

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

/** Scans per calendar day, including days with no scans. */
export async function getDailyScans(range: AnalyticsRange): Promise<DailyScanPoint[]> {
  const rows = await query<{ date: string; scanCount: number }>(
    `with days as (
       select generate_series(
                (now() at time zone $2::text)::date - ($1::int - 1),
                (now() at time zone $2::text)::date,
                interval '1 day'
              )::date as day
     ),
     counts as (
       select (s.created_at at time zone $2::text)::date as day, count(*)::int as scan_count
       from scans s
       where (s.created_at at time zone $2::text)::date >= (now() at time zone $2::text)::date - ($1::int - 1)
       group by 1
     )
     select to_char(days.day, 'YYYY-MM-DD') as date,
            coalesce(counts.scan_count, 0)::int as "scanCount"
     from days
     left join counts on counts.day = days.day
     order by days.day`,
    [range, REPORTING_TIME_ZONE],
  );

  return rows;
}

/** Share of scans per material group inside the selected range. */
export async function getMaterialBreakdown(
  range: AnalyticsRange,
): Promise<MaterialBreakdownItem[]> {
  const rows = await query<{ materialGroup: MaterialGroup; scanCount: number }>(
    `select ci.material_group as "materialGroup", count(*)::int as "scanCount"
     from scans s
     join canonical_items ci on ci.slug = s.canonical_item
     where (s.created_at at time zone $2::text)::date >= (now() at time zone $2::text)::date - ($1::int - 1)
     group by ci.material_group
     order by count(*) desc, ci.material_group asc`,
    [range, REPORTING_TIME_ZONE],
  );

  const total = rows.reduce((sum, row) => sum + row.scanCount, 0);

  return rows.map((row) => ({
    ...row,
    share: total > 0 ? row.scanCount / total : 0,
  }));
}

/** Most scanned items inside the selected range. */
export async function getTopItemsInRange(
  range: AnalyticsRange,
  limit = 5,
): Promise<LeaderboardItem[]> {
  const rows = await query<{
    canonicalItem: string;
    displayName: string;
    materialGroup: MaterialGroup;
    scanCount: number;
    share: number;
  }>(
    `select ci.slug as "canonicalItem",
            ci.display_name as "displayName",
            ci.material_group as "materialGroup",
            count(s.id)::int as "scanCount",
            case
              when sum(count(s.id)) over () = 0 then 0
              else count(s.id)::float8 / sum(count(s.id)) over ()
            end as "share"
     from scans s
     join canonical_items ci on ci.slug = s.canonical_item
     where (s.created_at at time zone $3::text)::date >= (now() at time zone $3::text)::date - ($1::int - 1)
     group by ci.slug, ci.display_name, ci.material_group
     order by count(s.id) desc, ci.display_name asc
     limit $2::int`,
    [range, limit, REPORTING_TIME_ZONE],
  );

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export async function getInsights(range: AnalyticsRange): Promise<InsightsData> {
  const [overview, topItems, confusingItems, dailyScans, materialBreakdown] =
    await Promise.all([
      getOverview(),
      getTopItemsInRange(range, 5),
      getConfusingItems({ limit: 5 }),
      getDailyScans(range),
      getMaterialBreakdown(range),
    ]);

  return {
    range,
    minFeedback: MIN_FEEDBACK_RESPONSES,
    overview,
    topItems,
    confusingItems,
    dailyScans,
    materialBreakdown,
    generatedAt: new Date().toISOString(),
  };
}
