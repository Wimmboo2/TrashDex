import { LeaderboardView } from "@/components/leaderboard/LeaderboardView";
import type { LeaderboardView as LeaderboardViewName } from "@/components/leaderboard/LeaderboardTabs";
import { getConfusingItems, getOverview, MIN_FEEDBACK_RESPONSES } from "@/lib/analytics";
import { isDatabaseConfigured } from "@/lib/db";
import { getLeaderboard } from "@/lib/scan-store";
import type { ConfusingItem, LeaderboardItem } from "@/lib/types";

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
  let feedbackCount = 0;
  let error: string | null = null;

  if (!isDatabaseConfigured()) {
    error = "The leaderboard is not configured yet. Add DATABASE_URL on the server.";
  } else {
    // Both views load together, so switching tabs is instant instead of waiting
    // for another server round trip.
    try {
      const [scanned, confusing, feedback] = await Promise.all([
        getLeaderboard(20),
        getConfusingItems({ limit: 20 }),
        getOverview().then((overview) => overview.feedbackCount),
      ]);
      scannedItems = scanned;
      confusingItems = confusing;
      feedbackCount = feedback;
    } catch {
      error = "The leaderboard is temporarily unavailable. Try again in a moment.";
    }
  }

  return (
    <LeaderboardView
      initialView={view}
      scanned={scannedItems}
      confusing={confusingItems}
      feedbackCount={feedbackCount}
      error={error}
      minFeedback={MIN_FEEDBACK_RESPONSES}
    />
  );
}