"use client";

import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { fill } from "@/lib/i18n/messages";

export function DataNotes({ minFeedback }: { minFeedback: number }) {
  const { copy: text, reserve } = useI18n();
  const notes = [
    { text: text.insights.noteWindow, reserve: reserve.insights.noteWindow },
    { text: text.insights.noteScans, reserve: reserve.insights.noteScans },
    {
      text: fill(text.insights.noteCorrectness, { min: minFeedback }),
      reserve: fill(reserve.insights.noteCorrectness, { min: minFeedback }),
    },
    { text: text.insights.noteFeedback, reserve: reserve.insights.noteFeedback },
    {
      text: fill(text.insights.noteConfusing, { min: minFeedback }),
      reserve: fill(reserve.insights.noteConfusing, { min: minFeedback }),
    },
    { text: text.insights.noteDiversion, reserve: reserve.insights.noteDiversion },
  ];

  return (
    <section className="data-notes" aria-labelledby="data-notes-title">
      <h2 id="data-notes-title">
        <StableText block text={text.insights.notesTitle} reserve={reserve.insights.notesTitle} />
      </h2>
      <ul>
        {notes.map((note) => (
          <li key={note.text}>
            <StableText block text={note.text} reserve={note.reserve} />
          </li>
        ))}
      </ul>
    </section>
  );
}
