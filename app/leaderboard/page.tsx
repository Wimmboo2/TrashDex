import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import type { LeaderboardView as LeaderboardViewName } from "@/components/leaderboard/LeaderboardTabs";
import { getConfusingItems, getOverview, MIN_FEEDBACK_RESPONSES } from "@/lib/analytics";
import { isDatabaseConfigured } from "@/lib/db";
import { getLeaderboard } from "@/lib/scan-store";
import type { ConfusingItem, LeaderboardItem, Overview } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaderboard | TrashDex",
  description: "The most-scanned item types on TrashDex, counted from real scans.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawView = Array.isArray(params.view) ? params.view[0] : params.view;
  const view: LeaderboardViewName = rawView === "confusing" ? "confusing" : "scanned";

  let scannedItems: LeaderboardItem[] = [];
  let confusingItems: ConfusingItem[] = [];
  let overview: Overview | null = null;
  let updatedAt: string | null = null;
  let error: "unconfigured" | "unavailable" | null = null;

  if (!isDatabaseConfigured()) {
    error = "unconfigured";
  } else {
    // Both views load together, so switching tabs is instant instead of waiting
    // for another server round trip.
    try {
      const [scanned, confusing, summary] = await Promise.all([
        getLeaderboard(20),
        getConfusingItems({ limit: 20 }),
        getOverview(),
      ]);
      scannedItems = scanned;
      confusingItems = confusing;
      overview = summary;
      updatedAt = new Date().toISOString();
    } catch {
      error = "unavailable";
    }
  }

  return (
    <LeaderboardView
      initialView={view}
      scanned={scannedItems}
      confusing={confusingItems}
      overview={overview}
      updatedAt={updatedAt}
      error={error}
      minFeedback={MIN_FEEDBACK_RESPONSES}
    />
  );
}