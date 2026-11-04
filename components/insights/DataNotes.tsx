"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { fill } from "@/lib/i18n/messages";

export function DataNotes({ minFeedback }: { minFeedback: number }) {
  const { copy: text } = useI18n();

  return (
    <section className="data-notes" aria-labelledby="data-notes-title">
      <h2 id="data-notes-title">{text.insights.notesTitle}</h2>
      <ul>
        <li>{text.insights.noteWindow}</li>
        <li>{text.insights.noteScans}</li>
        <li>{fill(text.insights.noteCorrectness, { min: minFeedback })}</li>
        <li>{text.insights.noteFeedback}</li>
        <li>{fill(text.insights.noteConfusing, { min: minFeedback })}</li>
        <li>{text.insights.noteDiversion}</li>
      </ul>
    </section>
  );
}
