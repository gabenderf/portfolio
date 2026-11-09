import { site } from "../content/site";
import { Btn } from "./Btn";

export function Hero() {
  const { hero } = site;
  return (
    <section className="hero" id="topo">
      <div className="hero__wash" aria-hidden="true"></div>
      <div className="page-pad">
        <div className="container">
          <div className="hero__copy sd-fade-out">
            <div>
              <span className="tag">
                <span className="tag__dot tag__dot--live" aria-hidden="true"></span> {hero.status}
              </span>
            </div>
            <h1 className="t-display">
              {hero.titleLine1}
              <br />
              <em>{hero.titleLine2}</em>
            </h1>
            <p className="t-body-lg hero-lead">{hero.lead}</p>
            <div className="cluster">
              <Btn variant="white" icon="arrow" magnetic href={hero.primary.href}>
                {hero.primary.label}
              </Btn>
              <Btn variant="ghost" icon="arrow" magnetic href={hero.secondary.href}>
                {hero.secondary.label}
              </Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
