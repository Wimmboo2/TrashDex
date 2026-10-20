export default function InsightsLoading() {
  return (
    <main className="insights-page" aria-busy="true">
      <div className="insights-head">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-line" />
      </div>
      <div className="stat-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="stat" key={index}>
            <div className="skeleton skeleton-line short" />
            <div className="skeleton skeleton-title" />
          </div>
        ))}
      </div>
      <div className="insights-block">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-block" />
      </div>
    </main>
  );
}
