import { site } from "../content/site";
import { Reveal } from "./useReveal";

export function Principles() {
  const { principles: p } = site;
  return (
    <section className="band principles" id="principios">
      <div className="page-pad">
        <div className="container">
          <header className="band-head">
            <Reveal>
              <span className="tag tag--accent">{p.tag}</span>
              <h2 className="t-h2" style={{ marginTop: "0.8rem" }}>
                {p.title}
              </h2>
            </Reveal>
            <Reveal as="p" className="text-muted" index={1}>
              {p.lead}
            </Reveal>
          </header>
          <div className="principles-grid">
            {p.items.map((it, i) => (
              <Reveal key={it.n} as="article" className="principle spotlight" index={i % 3}>
                <p className="t-label text-accent">{it.n}</p>
                <h3 className="t-h5">{it.title}</h3>
                <p className="text-muted">{it.text}</p>
                <ul className="principle__origin" aria-label="Projeto de origem">
                  {it.origin.map((o) => (
                    <li key={o} className="tag tag--sm tag--gray">
                      {o}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
