"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="leaderboard-page">
      <div className="empty-state" role="alert">
        <h1>Something went wrong.</h1>
        <p>The page could not load. Try again, or head back to the scanner.</p>
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
