import { site } from "../content/site";
import { Reveal } from "./useReveal";

export function About() {
  const { about: a } = site;
  return (
    <section className="band about" id="sobre">
      <div className="page-pad">
        <div className="container">
          <header className="band-head">
            <Reveal>
              <span className="tag tag--gray">{a.tag}</span>
              <h2 className="t-h2" style={{ marginTop: "0.8rem" }}>
                {a.title}
              </h2>
            </Reveal>
          </header>

          <div className="about-grid">
            <div className="about-copy">
              {a.paragraphs.map((p, i) => (
                <Reveal key={i} as="p" className="t-body-lg text-muted" index={i}>
                  {p}
                </Reveal>
              ))}

              <Reveal className="about-edu spotlight" index={2}>
                <p className="t-label text-accent">{a.education.label}</p>
                <p className="about-edu__title">{a.education.title}</p>
                <p className="text-muted">{a.education.text}</p>
              </Reveal>
            </div>

            <div className="about-side">
              <Reveal as="ol" className="about-timeline" aria-label={a.timelineLabel}>
                {a.timeline.map((t) => (
                  <li key={t.what}>
                    <span className="t-label text-faint">{t.when}</span>
                    <strong>{t.what}</strong>
                    <p className="text-muted">{t.text}</p>
                  </li>
                ))}
              </Reveal>

              <Reveal className="about-tools" index={1}>
                <p className="t-label text-accent">{a.toolsLabel}</p>
                <ul>
                  {a.tools.map((t) => (
                    <li key={t.name}>
                      <strong>{t.name}</strong>
                      <span>{t.use}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
