import { useState } from "react";
import { site } from "../content/site";
import { useRovingTabs } from "./useRovingTabs";
import { Reveal } from "./useReveal";

export function HowIWork() {
  const { how: h } = site;
  const [step, setStep] = useState(0);
  const onKeyDown = useRovingTabs(setStep);
  const activeCast = h.steps[step].cast;

  return (
    <section className="band how" id="como-trabalho">
      <div className="page-pad">
        <div className="container">
          <header className="band-head">
            <Reveal>
              <span className="tag tag--accent">{h.tag}</span>
              <h2 className="t-h2" style={{ marginTop: "0.8rem" }}>
                {h.title}
              </h2>
            </Reveal>
            <Reveal as="p" className="text-muted" index={1}>
              {h.lead}
            </Reveal>
          </header>

          <div className="how-body">
            <div className="how-flow" role="tablist" aria-label={h.stepsLabel} onKeyDown={onKeyDown}>
              {h.steps.map((s, i) => (
                <button
                  key={s.n}
                  type="button"
                  role="tab"
                  id={`how-tab-${i}`}
                  className="how-step spotlight"
                  aria-selected={step === i}
                  aria-controls={`how-panel-${i}`}
                  tabIndex={step === i ? 0 : -1}
                  data-past={i < step ? "" : undefined}
                  onClick={() => setStep(i)}
                >
                  <span className="how-step__n">{s.n}</span>
                  <strong className="how-step__label">{s.label}</strong>
                  <span className="how-step__short">{s.short}</span>
                </button>
              ))}
            </div>

            {h.steps.map((s, i) => (
              <article
                key={s.n}
                className="how-detail"
                id={`how-panel-${i}`}
                role="tabpanel"
                aria-labelledby={`how-tab-${i}`}
                hidden={step !== i}
              >
                <div className="how-detail__head">
                  <h3 className="t-h4">{s.title}</h3>
                  <p className="text-muted">{s.text}</p>
                </div>
                <div className="how-detail__cols">
                  <div className="how-case">
                    <p className="t-label text-accent">{h.exampleLabel}</p>
                    <p>{s.example}</p>
                  </div>
                  <div className="how-case how-case--site">
                    <p className="t-label text-accent">{h.siteLabel}</p>
                    <p>{s.site}</p>
                  </div>
                </div>
              </article>
            ))}

            <div className="how-cast" aria-label={h.castLabel}>
              <p className="t-label text-faint how-cast__label">{h.castLabel}</p>
              <ul>
                {h.cast.map((c, i) => (
                  <li key={c.who} className="how-cast__item" data-on={activeCast === i ? "" : undefined}>
                    <strong>{c.who}</strong>
                    <span>{c.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
