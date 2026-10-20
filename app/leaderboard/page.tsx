import Link from "next/link";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { Icon } from "@/components/ui/Icon";
import { isDatabaseConfigured } from "@/lib/db";
import { getLeaderboard } from "@/lib/scan-store";
import type { LeaderboardItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Leaderboard | TrashDex",
  description: "The most-scanned item types on TrashDex, counted from real scans.",
};

export default async function LeaderboardPage() {
  let items: LeaderboardItem[] = [];
  let error: string | null = null;

  if (!isDatabaseConfigured()) {
    error = "The leaderboard is not configured yet. Add DATABASE_URL on the server.";
  } else {
    try {
      items = await getLeaderboard(20);
    } catch {
      error = "The leaderboard is temporarily unavailable. Try again in a moment.";
    }
  }

  return (
    <main className="leaderboard-page">
      <div className="leaderboard-head">
        <p className="kicker">Public leaderboard</p>
        <h1>Most-scanned items.</h1>
        <p>
          Counts come from real TrashDex scans. No accounts, no seeded numbers, no fake rankings.
        </p>
      </div>

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
      ) : items.length === 0 ? (
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
        <LeaderboardList items={items} />
      )}

      <div className="leaderboard-footer">
        <Link className="btn btn-secondary" href="/">
          Back to the scanner
        </Link>
        <p className="muted-small">
          Rankings count the item type the model predicted. Corrections are stored as unverified
          feedback and do not rewrite scan history.
        </p>
      </div>
    </main>
  );
}
