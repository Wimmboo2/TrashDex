"use client";

import Link from "next/link";

export default function LeaderboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="leaderboard-page">
      <div className="empty-state" role="alert">
        <h1>Leaderboard unavailable</h1>
        <p>The leaderboard could not load. Try again in a moment.</p>
        <div className="feedback-actions">
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-secondary" href="/">
            Back to the scanner
          </Link>
        </div>
      </div>
    </main>
  );
}
