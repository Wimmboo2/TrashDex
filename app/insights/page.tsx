import { InsightsView } from "@/components/insights/InsightsView";
import { getInsights, MIN_FEEDBACK_RESPONSES, parseAnalyticsRange } from "@/lib/analytics";
import { isDatabaseConfigured } from "@/lib/db";
import type { InsightsData } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Insights | TrashDex",
  description: "What people scan on TrashDex, and which items they find confusing.",
};

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawRange = Array.isArray(params.range) ? params.range[0] : params.range;
  const range = parseAnalyticsRange(rawRange);

  let datasets: Record<7 | 30, InsightsData> | null = null;
  let error: string | null = null;

  if (!isDatabaseConfigured()) {
    error = "The insights dashboard is not configured yet. Add DATABASE_URL on the server.";
  } else {
    // Both ranges load together, so switching the range is instant instead of
    // waiting for another server round trip.
    try {
      const [sevenDays, thirtyDays] = await Promise.all([getInsights(7), getInsights(30)]);
      datasets = { 7: sevenDays, 30: thirtyDays };
    } catch {
      error = "The insights dashboard is temporarily unavailable. Try again in a moment.";
    }
  }

  return (
    <InsightsView
      initialRange={range}
      datasets={datasets}
      error={error}
      minFeedback={MIN_FEEDBACK_RESPONSES}
    />
  );
}