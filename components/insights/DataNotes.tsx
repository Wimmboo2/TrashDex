export function DataNotes({ minFeedback }: { minFeedback: number }) {
  return (
    <section className="data-notes" aria-labelledby="data-notes-title">
      <h2 id="data-notes-title">What these numbers mean, and what they do not</h2>
      <ul>
        <li>
          The impact cards are all time. The chart, material mix, and “most scanned in this range”
          list are only the last 7 or 30 days in Asia/Jakarta. Those totals can differ, and both
          can be right.
        </li>
        <li>
          Scans are photos people submitted here. They are not a count of waste at a school or in a
          city.
        </li>
        <li>
          Reported correctness is correct feedback divided by all feedback. It is hidden until
          there are at least {minFeedback} responses, because a smaller sample is too thin to show
          as a rate.
        </li>
        <li>
          Feedback is anonymous and self-reported. A correction is stored, and it is not treated as
          a confirmed model error.
        </li>
        <li>
          An item is ranked as confusing only after {minFeedback} feedback responses of its own.
          Responses spread across different items do not add up to one ranking.
        </li>
        <li>
          The diversion number is a rough classification count. It is not kilograms diverted and
          not proof that anyone used the right bin.
        </li>
      </ul>
    </section>
  );
}
