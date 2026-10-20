"use client";

import Link from "next/link";
import type { MouseEvent } from "react";

export type LeaderboardView = "scanned" | "confusing";

export function LeaderboardTabs({
  view,
  onSelect,
}: {
  view: LeaderboardView;
  onSelect: (view: LeaderboardView) => void;
}) {
  const tabs: { id: LeaderboardView; label: string; href: string }[] = [
    { id: "scanned", label: "Most scanned", href: "/leaderboard?view=scanned" },
    { id: "confusing", label: "Most confusing", href: "/leaderboard?view=confusing" },
  ];

  function handleClick(event: MouseEvent<HTMLAnchorElement>, next: LeaderboardView) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect(next);
  }

  return (
    <nav className="view-tabs" aria-label="Leaderboard view">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`view-tab${view === tab.id ? " is-active" : ""}`}
          aria-current={view === tab.id ? "page" : undefined}
          scroll={false}
          onClick={(event) => handleClick(event, tab.id)}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}