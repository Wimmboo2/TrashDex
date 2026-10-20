export function DataNotes() {
  return (
    <section className="data-notes" aria-labelledby="data-notes-title">
      <h2 id="data-notes-title">What this data can and cannot tell you</h2>
      <ul>
        <li>
          These are scans recorded on TrashDex. They are not a measurement of how much waste your
          school or city produces.
        </li>
        <li>
          Feedback is self reported and anonymous. It shows what people thought of a result, not a
          verified accuracy score.
        </li>
        <li>
          Corrections are stored as unverified feedback. A correction is not treated as a confirmed
          error.
        </li>
        <li>
          Items with fewer than {5} feedback responses are never ranked as confusing, because the
          sample is too small to mean anything.
        </li>
        <li>Small samples are noisy. Read the numbers as a signal, not a measurement.</li>
      </ul>
    </section>
  );
}
