import Link from "next/link";
import { ScanExperience } from "@/components/scanner/ScanExperience";
import { Icon } from "@/components/ui/Icon";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">A waste scanner for everyday things</p>
          <h1>
            Scan it. Sort it.
            <span className="hero-accent">Get it right.</span>
          </h1>
          <p className="hero-sub">
            Photograph a waste item. TrashDex identifies the material, sorts the stream, and shows
            you how to dispose of it.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#scanner">
              Scan an item
              <Icon name="arrow-right" size={17} />
            </a>
            <Link className="btn btn-secondary" href="/leaderboard">
              See the leaderboard
            </Link>
          </div>
          <p className="hero-note">No account. No photo storage.</p>
        </div>

        <div className="hero-scanner" id="scanner">
          <ScanExperience />
        </div>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title">Three steps, one clear answer.</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>Take a photo</h3>
            <p>Use your camera or drop in an image of one item.</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>Let TrashDex read it</h3>
            <p>The model identifies the item and its likely material.</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>Sort it with confidence</h3>
            <p>Get the waste stream, a disposal plan, and a clear uncertainty note.</p>
          </div>
        </div>
      </section>

      <section className="split" aria-labelledby="result-title">
        <div>
          <h2 id="result-title">A result you can actually use.</h2>
          <p>
            Every scan gives you the item, the material, the stream, and a short disposal plan. When
            the model is unsure, it says so instead of pretending.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href="/leaderboard">
              Browse the item leaderboard
              <Icon name="arrow-right" size={17} />
            </Link>
            <Link className="btn btn-ghost" href="/insights">
              Open the insights dashboard
            </Link>
          </div>
        </div>
        <div className="feature-list">
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>Item and material</h3>
              <p>A specific label, not just plastic.</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>Waste stream</h3>
              <p>Recycling, organic, hazardous, e-waste, textile, or residual.</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>Disposal steps</h3>
              <p>Short instructions with a general guidance note, not a fake local rule.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
