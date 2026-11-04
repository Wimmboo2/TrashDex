"use client";

import Link from "next/link";
import { ScanExperience } from "@/components/scanner/ScanExperience";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { Icon } from "@/components/ui/Icon";

export function HomeContent() {
  const { copy: text } = useI18n();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">{text.home.kicker}</p>
          <h1>
            {text.home.title}
            <span className="hero-accent">{text.home.accent}</span>
          </h1>
          <p className="hero-sub">{text.home.sub}</p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#scanner">
              {text.home.scan}
              <Icon name="arrow-right" size={17} />
            </a>
            <Link className="btn btn-secondary" href="/leaderboard">
              {text.home.leaderboard}
            </Link>
          </div>
          <p className="hero-note">{text.home.note}</p>
        </div>

        <div className="hero-scanner" id="scanner">
          <ScanExperience />
        </div>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title">{text.home.how}</h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>{text.home.step1Title}</h3>
            <p>{text.home.step1Body}</p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>{text.home.step2Title}</h3>
            <p>{text.home.step2Body}</p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>{text.home.step3Title}</h3>
            <p>{text.home.step3Body}</p>
          </div>
        </div>
      </section>

      <section className="split" aria-labelledby="result-title">
        <div>
          <h2 id="result-title">{text.home.resultTitle}</h2>
          <p>{text.home.resultBody}</p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href="/leaderboard">
              {text.home.browse}
              <Icon name="arrow-right" size={17} />
            </Link>
            <Link className="btn btn-ghost" href="/insights">
              {text.home.openInsights}
            </Link>
          </div>
        </div>
        <div className="feature-list">
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>{text.home.featureItem}</h3>
              <p>{text.home.featureItemBody}</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>{text.home.featureStream}</h3>
              <p>{text.home.featureStreamBody}</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>{text.home.featureSteps}</h3>
              <p>{text.home.featureStepsBody}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
