import Link from "next/link";

export type LeaderboardView = "scanned" | "confusing";

export function LeaderboardTabs({ view }: { view: LeaderboardView }) {
  const tabs: { id: LeaderboardView; label: string; href: string }[] = [
    { id: "scanned", label: "Most scanned", href: "/leaderboard?view=scanned" },
    { id: "confusing", label: "Most confusing", href: "/leaderboard?view=confusing" },
  ];

  return (
    <nav className="view-tabs" aria-label="Leaderboard view">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`view-tab${view === tab.id ? " is-active" : ""}`}
          aria-current={view === tab.id ? "page" : undefined}
          scroll={false}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
