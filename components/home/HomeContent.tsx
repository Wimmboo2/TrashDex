"use client";

import Link from "next/link";
import { ScanExperience } from "@/components/scanner/ScanExperience";
import { useI18n } from "@/components/i18n/LanguageProvider";
import { StableText } from "@/components/i18n/StableText";
import { Icon } from "@/components/ui/Icon";

export function HomeContent() {
  const { copy: text, reserve } = useI18n();

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="kicker">
            <StableText block text={text.home.kicker} reserve={reserve.home.kicker} />
          </p>
          <h1>
            <StableText block text={text.home.title} reserve={reserve.home.title} />
            <span className="hero-accent">
              <StableText block text={text.home.accent} reserve={reserve.home.accent} />
            </span>
          </h1>
          <p className="hero-sub">
            <StableText block text={text.home.sub} reserve={reserve.home.sub} />
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#scanner">
              <StableText text={text.home.scan} reserve={reserve.home.scan} />
              <Icon name="arrow-right" size={17} />
            </a>
            <Link className="btn btn-secondary" href="/leaderboard">
              <StableText text={text.home.leaderboard} reserve={reserve.home.leaderboard} />
            </Link>
          </div>
          <p className="hero-note">
            <StableText block text={text.home.note} reserve={reserve.home.note} />
          </p>
        </div>

        <div className="hero-scanner" id="scanner">
          <ScanExperience />
        </div>
      </section>

      <section className="how" aria-labelledby="how-title">
        <h2 id="how-title">
          <StableText block text={text.home.how} reserve={reserve.home.how} />
        </h2>
        <div className="steps">
          <div className="step">
            <span className="step-number">1</span>
            <h3>
              <StableText block text={text.home.step1Title} reserve={reserve.home.step1Title} />
            </h3>
            <p>
              <StableText block text={text.home.step1Body} reserve={reserve.home.step1Body} />
            </p>
          </div>
          <div className="step">
            <span className="step-number">2</span>
            <h3>
              <StableText block text={text.home.step2Title} reserve={reserve.home.step2Title} />
            </h3>
            <p>
              <StableText block text={text.home.step2Body} reserve={reserve.home.step2Body} />
            </p>
          </div>
          <div className="step">
            <span className="step-number">3</span>
            <h3>
              <StableText block text={text.home.step3Title} reserve={reserve.home.step3Title} />
            </h3>
            <p>
              <StableText block text={text.home.step3Body} reserve={reserve.home.step3Body} />
            </p>
          </div>
        </div>
      </section>

      <section className="split" aria-labelledby="result-title">
        <div>
          <h2 id="result-title">
            <StableText block text={text.home.resultTitle} reserve={reserve.home.resultTitle} />
          </h2>
          <p>
            <StableText block text={text.home.resultBody} reserve={reserve.home.resultBody} />
          </p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href="/leaderboard">
              <StableText text={text.home.browse} reserve={reserve.home.browse} />
              <Icon name="arrow-right" size={17} />
            </Link>
            <Link className="btn btn-ghost" href="/insights">
              <StableText text={text.home.openInsights} reserve={reserve.home.openInsights} />
            </Link>
          </div>
        </div>
        <div className="feature-list">
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>
                <StableText block text={text.home.featureItem} reserve={reserve.home.featureItem} />
              </h3>
              <p>
                <StableText block text={text.home.featureItemBody} reserve={reserve.home.featureItemBody} />
              </p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>
                <StableText block text={text.home.featureStream} reserve={reserve.home.featureStream} />
              </h3>
              <p>
                <StableText
                  block
                  text={text.home.featureStreamBody}
                  reserve={reserve.home.featureStreamBody}
                />
              </p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-dot" aria-hidden="true" />
            <div>
              <h3>
                <StableText block text={text.home.featureSteps} reserve={reserve.home.featureSteps} />
              </h3>
              <p>
                <StableText
                  block
                  text={text.home.featureStepsBody}
                  reserve={reserve.home.featureStepsBody}
                />
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
