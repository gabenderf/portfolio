import type { MouseEvent } from "react";
import { site } from "../content/site";
import { Icon } from "./Icons";
import { useMagnetic } from "./useMagnetic";
import { Reveal } from "./useReveal";

export function Contact() {
  const { contact: c, footer: f } = site;
  const mag = useMagnetic();
  return (
    <footer className="site-foot" id="contato">
      <div className="site-foot__wash" aria-hidden="true"></div>
      <div className="page-pad" style={{ width: "100%" }}>
        <div className="container">
          <Reveal className="contact-hero">
            <div className="contact-hero__head">
              <p className="t-label text-accent">{c.kicker}</p>
              <h2 className="contact-hero__title">{c.title}</h2>
              <p className="contact-hero__lead">{c.lead}</p>
            </div>

            <div className="contact-bento" aria-label={c.bentoLabel}>
              {c.cards.map((card) => (
                <a
                  key={card.title}
                  ref={card.todo ? undefined : mag}
                  className={card.featured ? "contact-card contact-card--featured spotlight" : "contact-card spotlight"}
                  href={card.href}
                  {...(card.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  {...(card.todo
                    ? { "data-todo": "", "aria-disabled": true, onClick: (e: MouseEvent<HTMLAnchorElement>) => e.preventDefault() }
                    : { "data-magnetic": "" })}
                  aria-label={card.ariaLabel}
                >
                  <div className="contact-card__icon-wrap">
                    <div className="contact-card__icon">
                      <Icon name={card.icon} />
                    </div>
                    <span className="contact-card__handle">{card.handle}</span>
                  </div>
                  <div className="contact-card__body">
                    <h3 className="contact-card__title">{card.title}</h3>
                    <p className="contact-card__desc">{card.desc}</p>
                  </div>
                  <div className="contact-card__badge">
                    <span>{card.badge}</span>
                    {card.todo ? null : <Icon name="arrow" size={14} />}
                  </div>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal className="status-note" aria-label={c.status.title}>
            <p className="t-label text-accent">{c.status.title}</p>
            <ul className="status-note__list">
              {c.status.items.map((it) => (
                <li key={it.state} className="status-note__item" data-tone={it.tone}>
                  <strong>{it.state}</strong>
                  <p>{it.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <p className="foot-name">{f.name}</p>
          <div className="foot-row foot-row--bot" style={{ paddingTop: "1.25rem" }}>
            <div className="cluster" style={{ gap: "0.4rem" }}>
              {f.links.map((l) => (
                <a key={l.href} className="nav-link" href={l.href}>
                  {l.label}
                </a>
              ))}
            </div>
            <p className="t-micro text-faint">{f.credit}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
