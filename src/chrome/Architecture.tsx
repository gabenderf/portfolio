import { useState } from "react";
import { site, type FlowNode, type FlowNodeId } from "../content/site";
import { useRovingTabs } from "./useRovingTabs";

type Tone = "blue" | "green" | "amber" | "white";
const TONE: Record<Tone, string> = { blue: "#60a5fa", green: "#2fbf71", amber: "#f5a524", white: "#ffffff" };

interface Box {
  id: FlowNodeId;
  x: number;
  y: number;
  w: number;
  h: number;
  tone: Tone;
  active?: boolean;
}
interface Wire {
  d: string;
  fast?: boolean;
}

/* Layout largo (desktop): 6 colunas, da esquerda para a direita. */
const WIDE_BOXES: Box[] = [
  { id: "mkt", x: 0, y: 97, w: 104, h: 56, tone: "white" },
  { id: "up", x: 135, y: 97, w: 104, h: 56, tone: "white" },
  { id: "ext", x: 270, y: 37, w: 104, h: 56, tone: "green" },
  { id: "col", x: 270, y: 157, w: 104, h: 56, tone: "green" },
  { id: "db", x: 405, y: 60, w: 104, h: 130, tone: "blue", active: true },
  { id: "motor", x: 540, y: 97, w: 104, h: 56, tone: "amber", active: true },
  { id: "saas", x: 675, y: 37, w: 104, h: 56, tone: "blue" },
  { id: "tv", x: 675, y: 157, w: 104, h: 56, tone: "blue" },
];
const WIDE_WIRES: Wire[] = [
  { d: "M 104 125 L 135 125" },
  { d: "M 239 125 C 255 125, 255 65, 270 65" },
  { d: "M 239 125 C 255 125, 255 185, 270 185" },
  { d: "M 374 65 C 390 65, 390 90, 405 90", fast: true },
  { d: "M 374 185 C 390 185, 390 160, 405 160", fast: true },
  { d: "M 509 125 L 540 125" },
  { d: "M 644 125 C 660 125, 660 65, 675 65" },
  { d: "M 644 125 C 660 125, 660 185, 675 185" },
];

/* Layout vertical (celular): mesma ordem, de cima para baixo. */
const TALL_BOXES: Box[] = [
  { id: "mkt", x: 65, y: 0, w: 210, h: 56, tone: "white" },
  { id: "up", x: 65, y: 86, w: 210, h: 56, tone: "white" },
  { id: "ext", x: 0, y: 172, w: 160, h: 56, tone: "green" },
  { id: "col", x: 180, y: 172, w: 160, h: 56, tone: "green" },
  { id: "db", x: 40, y: 258, w: 260, h: 108, tone: "blue", active: true },
  { id: "motor", x: 65, y: 396, w: 210, h: 56, tone: "amber", active: true },
  { id: "saas", x: 0, y: 482, w: 160, h: 56, tone: "blue" },
  { id: "tv", x: 180, y: 482, w: 160, h: 56, tone: "blue" },
];
const TALL_WIRES: Wire[] = [
  { d: "M 170 56 L 170 86" },
  { d: "M 170 142 C 170 157, 80 157, 80 172" },
  { d: "M 170 142 C 170 157, 260 157, 260 172" },
  { d: "M 80 228 C 80 243, 120 243, 120 258", fast: true },
  { d: "M 260 228 C 260 243, 220 243, 220 258", fast: true },
  { d: "M 170 366 L 170 396" },
  { d: "M 170 452 C 170 467, 80 467, 80 482" },
  { d: "M 170 452 C 170 467, 260 467, 260 482" },
];

function Node({ box, node }: { box: Box; node: FlowNode }) {
  const cx = box.w / 2;
  const lines = node.lines;
  const total = 17 + lines.length * 14;
  const top = (box.h - total) / 2 + 11;
  return (
    <g transform={`translate(${box.x}, ${box.y})`}>
      <rect className={box.active ? "arch-node arch-node-active" : "arch-node"} width={box.w} height={box.h} rx="2" />
      <text x={cx} y={top} fill={TONE[box.tone]} fontFamily="var(--font-mono)" fontSize="9.5" textAnchor="middle" letterSpacing="0.06em">
        {node.tag}
      </text>
      {lines.map((l, i) => (
        <text
          key={l}
          x={cx}
          y={top + 17 + i * 14}
          fill={i === 0 ? "#ffffff" : "#c9d3e3"}
          fontFamily="var(--font-sans)"
          fontSize="11.5"
          fontWeight={i === 0 ? 500 : 400}
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </g>
  );
}

function Flow({ boxes, wires, viewBox, className, label }: { boxes: Box[]; wires: Wire[]; viewBox: string; className: string; label: string }) {
  const nodes = site.architecture.pipeline.nodes;
  return (
    <svg className={`arch-pipeline-svg ${className}`} viewBox={viewBox} role="img" aria-label={label}>
      {wires.map((w) => (
        <path key={`w${w.d}`} className="arch-wire" d={w.d} />
      ))}
      {wires.map((w) => (
        <path key={`p${w.d}`} className={w.fast ? "arch-pulse-wire arch-pulse-wire--fast" : "arch-pulse-wire"} d={w.d} />
      ))}
      {boxes.map((b) => (
        <Node key={b.id} box={b} node={nodes[b.id]} />
      ))}
    </svg>
  );
}

export function Architecture() {
  const { architecture: a } = site;
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const onKeyDown = useRovingTabs(setStep);

  return (
    <section className="band arch" id="plataforma">
      <div className="page-pad">
        <div className="container">
          <div className="arch-grid">
            <div className="arch-sticky">
              <span className="tag">{a.tag}</span>
              <h2 className="t-h2">{a.title}</h2>
              <p className="text-muted">{a.lead}</p>
            </div>
            <div>
              <div className="pipe" role="tablist" aria-label={a.stepsLabel} onKeyDown={onKeyDown}>
                {a.steps.map((s, i) => (
                  <button
                    key={s.n}
                    type="button"
                    role="tab"
                    id={`step-tab-${i}`}
                    aria-selected={step === i}
                    aria-controls={`step-${i}`}
                    tabIndex={step === i ? 0 : -1}
                    onClick={() => setStep(i)}
                  >
                    <span>{s.n}</span>
                    <strong>{s.label}</strong>
                  </button>
                ))}
              </div>
              <div className="pipe-panels">
                {a.steps.map((s, i) => (
                  <article
                    key={s.n}
                    className="pipe-detail"
                    id={`step-${i}`}
                    role="tabpanel"
                    aria-labelledby={`step-tab-${i}`}
                    hidden={step !== i}
                  >
                    <h3 className="t-h4">{s.title}</h3>
                    <p className="text-muted">{s.text}</p>
                    <ul>
                      {s.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>

              <div className={paused ? "arch-pipeline-box pipeline-paused" : "arch-pipeline-box"}>
                <div className="arch-pipeline-header">
                  <div className="arch-pipeline-title">{a.pipeline.title}</div>
                  <button
                    type="button"
                    className="arch-pipeline-btn"
                    aria-label={a.pipeline.pauseAria}
                    aria-pressed={paused}
                    onClick={() => setPaused((p) => !p)}
                  >
                    {paused ? a.pipeline.playButton : a.pipeline.pauseButton}
                  </button>
                </div>
                <Flow boxes={WIDE_BOXES} wires={WIDE_WIRES} viewBox="0 28 779 194" className="arch-svg--wide" label={a.pipeline.svgLabel} />
                <Flow boxes={TALL_BOXES} wires={TALL_WIRES} viewBox="0 0 340 538" className="arch-svg--tall" label={a.pipeline.svgLabel} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
