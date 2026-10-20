import Link from "next/link";

export default function NotFound() {
  return (
    <main className="leaderboard-page">
      <div className="empty-state">
        <h1>That page is not here.</h1>
        <p>Head back to the scanner and try again.</p>
        <Link className="btn btn-primary" href="/">
          Back to the scanner
        </Link>
      </div>
    </main>
  );
}
