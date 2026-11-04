"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useI18n } from "@/components/i18n/LanguageProvider";

export type LeaderboardView = "scanned" | "confusing";

export function LeaderboardTabs({
  view,
  onSelect,
}: {
  view: LeaderboardView;
  onSelect: (view: LeaderboardView) => void;
}) {
  const { copy: text } = useI18n();
  const tabs: { id: LeaderboardView; label: string; href: string }[] = [
    { id: "scanned", label: text.leaderboard.mostScanned, href: "/leaderboard?view=scanned" },
    { id: "confusing", label: text.leaderboard.mostConfusing, href: "/leaderboard?view=confusing" },
  ];

  function handleClick(event: MouseEvent<HTMLAnchorElement>, next: LeaderboardView) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onSelect(next);
  }

  return (
    <nav className="view-tabs" aria-label={text.leaderboard.view}>
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
