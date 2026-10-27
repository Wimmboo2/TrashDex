"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";

const TOTAL = 5;

function TrashMark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="18" fill="#8c491a" />
      <path
        d="M18 22h28M26 22v-4h12v4M22 22l2 26h16l2-26"
        fill="none"
        stroke="#f5ead8"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

function FullscreenIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {active ? (
        <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
      ) : (
        <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
      )}
    </svg>
  );
}

const SLIDES = [
  {
    id: "title",
    className: "slide-title",
    content: (
      <>
        <div className="title-mark">
          <TrashMark size={58} />
        </div>
        <h1 className="deck-display">TrashDex</h1>
        <p className="title-line">
          Scan it. Sort it. <span>Get it right.</span>
        </p>
        <p className="title-sub">A waste scanner for everyday things.</p>
        <div className="title-meta">
          <span>Humans and Environment</span>
          <span>School project</span>
        </div>
      </>
    ),
  },
  {
    id: "problem",
    className: "slide-problem",
    content: (
      <>
        <div className="slide-split">
          <div>
            <p className="deck-kicker">The problem</p>
            <h2 className="deck-title">One item. One decision. And people guess.</h2>
          </div>
          <ul className="deck-points">
            <li>
              <strong>“Plastic” is not an instruction.</strong> A bottle, a sachet, and a cup do not
              go the same place.
            </li>
            <li>
              <strong>Rules vary.</strong> Nobody memorizes them at the bin.
            </li>
            <li>
              <strong>A wrong guess contaminates recycling.</strong> That is worse than not
              recycling at all.
            </li>
          </ul>
        </div>
        <p className="deck-callout">
          The environmental problem starts as a human decision problem.
        </p>
      </>
    ),
  },
  {
    id: "solution",
    className: "slide-solution",
    content: (
      <>
        <p className="deck-kicker">The product</p>
        <h2 className="deck-title">Photo in. Clear answer out.</h2>
        <div className="deck-steps">
          <div className="deck-step">
            <span className="deck-step-num">1</span>
            <h3>Take a photo</h3>
            <p>One item, from your camera or an upload.</p>
          </div>
          <div className="deck-step">
            <span className="deck-step-num">2</span>
            <h3>Read the item</h3>
            <p>The model names the item and its likely material.</p>
          </div>
          <div className="deck-step">
            <span className="deck-step-num">3</span>
            <h3>Sort it</h3>
            <p>Get the waste stream and short disposal steps.</p>
          </div>
        </div>
        <p className="deck-note">No account. No photo storage.</p>
      </>
    ),
  },
  {
    id: "how",
    className: "slide-how",
    content: (
      <>
        <p className="deck-kicker">Under the hood</p>
        <h2 className="deck-title">The model reads. The rules decide.</h2>
        <div className="deck-flow" aria-label="From photo to answer">
          <span className="deck-chip">Photo</span>
          <span className="deck-arrow">→</span>
          <span className="deck-chip">Model reads the item</span>
          <span className="deck-arrow">→</span>
          <span className="deck-chip">Checked result</span>
          <span className="deck-arrow">→</span>
          <span className="deck-chip">Fixed disposal rules</span>
        </div>
        <div className="deck-columns">
          <div>
            <h3>The model</h3>
            <p>
              Returns a structured guess: item, material, confidence. It never writes the disposal
              advice.
            </p>
          </div>
          <div>
            <h3>The rules</h3>
            <p>
              Map the material to a waste stream and short steps. A wrong label cannot silently
              rewrite the guidance.
            </p>
          </div>
        </div>
        <p className="deck-note">
          If the result does not fit the expected shape, the app rejects it instead of guessing.
        </p>
      </>
    ),
  },
  {
    id: "thanks",
    className: "slide-thanks",
    content: (
      <div className="thanks-patch">
        <h2 className="deck-thanks">Thank you.</h2>
      </div>
    ),
  },
];

export function Deck() {
  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);

  const next = useCallback(() => setIndex((current) => Math.min(TOTAL - 1, current + 1)), []);
  const prev = useCallback(() => setIndex((current) => Math.max(0, current - 1)), []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen can be blocked by the browser; the deck still works.
    }
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stageRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        (event.key === " " || event.key === "Enter") &&
        target?.closest("button, a, input, textarea")
      ) {
        return;
      }

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case " ":
        case "PageDown":
        case "Enter":
          event.preventDefault();
          next();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
        case "Backspace":
          event.preventDefault();
          prev();
          break;
        case "Home":
          event.preventDefault();
          setIndex(0);
          break;
        case "End":
          event.preventDefault();
          setIndex(TOTAL - 1);
          break;
        case "f":
        case "F":
          event.preventDefault();
          void toggleFullscreen();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, toggleFullscreen]);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") touchStart.current = event.clientX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "touch" || touchStart.current === null) return;
    const delta = event.clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) < 48) return;
    if (delta < 0) next();
    else prev();
  }

  const slide = SLIDES[index];

  return (
    <div className="deck" role="region" aria-label="TrashDex pitch deck">
      <header className="deck-top">
        <span className="deck-brand">
          <TrashMark />
          TrashDex
        </span>
        <span className="deck-tag">Pitch</span>
      </header>

      <div
        className="deck-stage"
        ref={stageRef}
        tabIndex={-1}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <section
          key={slide.id}
          className={`deck-slide ${slide.className}`}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} of ${TOTAL}`}
        >
          {slide.content}
        </section>
      </div>

      <footer className="deck-footer">
        <span className="deck-counter">
          {String(index + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
        <div className="deck-controls">
          <button
            type="button"
            className="deck-btn"
            onClick={prev}
            disabled={index === 0}
            aria-label="Previous slide"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className="deck-btn"
            onClick={next}
            disabled={index === TOTAL - 1}
            aria-label="Next slide"
          >
            <Chevron direction="right" />
          </button>
          <button
            type="button"
            className="deck-btn"
            onClick={() => void toggleFullscreen()}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-pressed={isFullscreen}
          >
            <FullscreenIcon active={isFullscreen} />
          </button>
        </div>
      </footer>

      <div className="deck-progress" aria-hidden="true">
        <span style={{ width: `${((index + 1) / TOTAL) * 100}%` }} />
      </div>

      <p className="sr-only" aria-live="polite">
        Slide {index + 1} of {TOTAL}
      </p>
    </div>
  );
}