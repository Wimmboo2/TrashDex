import Link from "next/link";
import { ConfusingList } from "@/components/leaderboard/ConfusingList";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { LeaderboardTabs } from "@/components/leaderboard/LeaderboardTabs";
import { Icon } from "@/components/ui/Icon";
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
  const view = rawView === "confusing" ? "confusing" : "scanned";

  let scannedItems: LeaderboardItem[] = [];
  let confusingItems: ConfusingItem[] = [];
  let feedbackCount = 0;
  let error: string | null = null;

  if (!isDatabaseConfigured()) {
    error = "The leaderboard is not configured yet. Add DATABASE_URL on the server.";
  } else {
    try {
      if (view === "confusing") {
        [confusingItems, feedbackCount] = await Promise.all([
          getConfusingItems({ limit: 20 }),
          getOverview().then((overview) => overview.feedbackCount),
        ]);
      } else {
        scannedItems = await getLeaderboard(20);
      }
    } catch {
      error = "The leaderboard is temporarily unavailable. Try again in a moment.";
    }
  }

  const isConfusing = view === "confusing";

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-head">
        <p className="kicker">Public leaderboard</p>
        <h1>{isConfusing ? "Most confusing items." : "Most-scanned items."}</h1>
        <p>
          {isConfusing
            ? "Items where people reported the result was wrong. This is reported confusion, not a confirmed model error."
            : "Counts come from real TrashDex scans. No accounts, no seeded numbers, no fake rankings."}
        </p>
      </div>

      <LeaderboardTabs view={view} />

      {error ? (
        <div className="empty-state" role="alert">
          <div className="empty-icon">
            <Icon name="alert" size={26} />
          </div>
          <h2>Leaderboard unavailable</h2>
          <p>{error}</p>
          <Link className="btn btn-secondary" href="/leaderboard">
            Try again
          </Link>
        </div>
      ) : isConfusing ? (
        confusingItems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Icon name="alert" size={26} />
            </div>
            <h2>Not enough feedback yet.</h2>
            <p>
              An item needs at least {MIN_FEEDBACK_RESPONSES} feedback responses before it can be
              ranked. {feedbackCount} feedback response{feedbackCount === 1 ? "" : "s"} recorded so
              far.
            </p>
            <Link className="btn btn-primary" href="/">
              Scan an item
              <Icon name="arrow-right" size={17} />
            </Link>
          </div>
        ) : (
          <ConfusingList items={confusingItems} minFeedback={MIN_FEEDBACK_RESPONSES} />
        )
      ) : scannedItems.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Icon name="trash" size={26} />
          </div>
          <h2>No scans yet.</h2>
          <p>Be the first to scan an item. The leaderboard fills up from real results only.</p>
          <Link className="btn btn-primary" href="/">
            Scan an item
            <Icon name="arrow-right" size={17} />
          </Link>
        </div>
      ) : (
        <LeaderboardList items={scannedItems} />
      )}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/">
          Back to the scanner
        </Link>
        <Link className="btn btn-secondary" href="/insights">
          Open the insights dashboard
          <Icon name="arrow-right" size={17} />
        </Link>
        <p className="muted-small">
          {isConfusing
            ? "Rankings use the share of feedback responses marked incorrect. Corrections are stored as unverified feedback and are not treated as confirmed errors."
            : "Rankings count the item type the model predicted. Corrections are stored as unverified feedback and do not rewrite scan history."}
        </p>
      </div>
    </main>
  );
}
