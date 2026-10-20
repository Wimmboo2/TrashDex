export default function LeaderboardLoading() {
  return (
    <main className="leaderboard-page" aria-busy="true">
      <div className="leaderboard-head">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
      </div>
      <div className="leaderboard-list">
        {Array.from({ length: 5 }).map((_, index) => (
          <div className="leaderboard-row skeleton-row" key={index}>
            <div className="skeleton skeleton-rank" />
            <div>
              <div className="skeleton skeleton-line short" />
              <div className="skeleton skeleton-line" />
            </div>
            <div className="skeleton skeleton-count" />
          </div>
        ))}
      </div>
    </main>
  );
}
