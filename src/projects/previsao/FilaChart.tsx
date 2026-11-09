import { FIM_TURNO, INICIO_TURNO, hhmm, type Previsao, type Simulacao } from "./model";
import { fmt } from "../../work/mock";

const W = 600;
const H = 262;
const L = 42;
const R = 10;
const T = 18;
const B = 180;
const STRIP_T = 192;
const STRIP_B = 214;
const T0 = INICIO_TURNO;
const T1 = FIM_TURNO + 5;

const x = (t: number) => L + ((t - T0) / (T1 - T0)) * (W - L - R);

interface Props {
  prev: Previsao;
  agora: number;
  comChegadas: boolean;
}

function caminho(sim: Simulacao, y: (v: number) => number): string {
  const p = sim.pontos;
  const partes: string[] = [];
  if (p[0].t > T0) partes.push(`M${x(T0).toFixed(1)} ${y(p[0].fila).toFixed(1)}`, `L${x(p[0].t).toFixed(1)} ${y(p[0].fila).toFixed(1)}`);
  else partes.push(`M${x(p[0].t).toFixed(1)} ${y(p[0].fila).toFixed(1)}`);
  for (let i = 1; i < p.length; i++) partes.push(`L${x(p[i].t).toFixed(1)} ${y(p[i].fila).toFixed(1)}`);
  return partes.join(" ");
}

/** Fila caindo em passos de 5 min: p50 (cheio), faixa até o p90 (tracejado), fila inteira (pontilhado). */
export function FilaChart({ prev, agora, comChegadas }: Props) {
  const { p50, p90, tudo } = prev;
  const maxV = Math.max(p50.pontos[0].fila, p90.pontos[0].fila, ...(comChegadas ? tudo.pontos.map((q) => q.fila) : []), 100);
  const ymax = Math.ceil(maxV / 100) * 100;
  const y = (v: number) => B - (v / ymax) * (B - T);

  // faixa entre p50 e p90
  const faixa =
    caminho(p90, y) +
    " " +
    [...p50.pontos]
      .reverse()
      .map((q) => `L${x(q.t).toFixed(1)} ${y(q.fila).toFixed(1)}`)
      .join(" ") +
    " Z";
  const area = caminho(p50, y) + ` L${x(p50.pontos[p50.pontos.length - 1].t).toFixed(1)} ${B} L${x(p50.pontos[0].t > T0 ? T0 : p50.pontos[0].t).toFixed(1)} ${B} Z`;

  const horas = [8, 10, 12, 14, 16];
  const maxCheg = Math.max(0.0001, ...prev.chegadasPorPasso.values());
  const larg = ((W - L - R) / (T1 - T0)) * 5 - 0.8;

  const term = p50.termino;
  const xTerm = term !== null ? x(term) : null;
  const fimX = x(FIM_TURNO);
  const marcaAgora = agora >= T0 && agora <= FIM_TURNO;

  const resumo =
    term === null
      ? `Fila obrigatória não zera até as 17:40; sobram ${fmt.int(Math.round(p50.sobra))} pedidos.`
      : `Fila obrigatória zera às ${hhmm(term)}.`;

  return (
    <svg className="pv-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={resumo}>
      {/* grade */}
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={L} x2={W - R} y1={y(ymax * f)} y2={y(ymax * f)} className="pv-grid" />
          <text x={L - 6} y={y(ymax * f) + 4} textAnchor="end" className="pv-tick">
            {fmt.int(ymax * f)}
          </text>
        </g>
      ))}
      {horas.map((h) => (
        <g key={h}>
          <line x1={x(h * 60)} x2={x(h * 60)} y1={T} y2={B} className="pv-grid pv-grid--v" />
          <text x={x(h * 60)} y={236} textAnchor="middle" className="pv-tick">
            {String(h).padStart(2, "0")}h
          </text>
        </g>
      ))}

      {/* capacidade ociosa depois do término */}
      {xTerm !== null && fimX - xTerm > 4 && (
        <g>
          <rect x={xTerm} y={T} width={fimX - xTerm} height={B - T} className="pv-ocioso" />
          {fimX - xTerm > 90 && (
            <text x={(xTerm + fimX) / 2} y={B - 8} textAnchor="middle" className="pv-ocioso-t">
              capacidade ociosa
            </text>
          )}
        </g>
      )}

      <path d={faixa} className="pv-faixa" />
      <path d={area} className="pv-area" />
      {comChegadas && <path d={caminho(tudo, y)} className="pv-tudo" fill="none" />}
      <path d={caminho(p90, y)} className="pv-p90" fill="none" />
      <path d={caminho(p50, y)} className="pv-p50" fill="none" />

      {/* chegadas previstas */}
      <text x={L - 6} y={STRIP_T + 14} textAnchor="end" className="pv-tick">
        {comChegadas ? "cheg." : ""}
      </text>
      <line x1={L} x2={W - R} y1={STRIP_B} y2={STRIP_B} className="pv-grid" />
      {comChegadas &&
        [...prev.chegadasPorPasso.entries()].map(([t, v]) => {
          const h = Math.max(1, (v / maxCheg) * (STRIP_B - STRIP_T));
          return <rect key={t} x={x(t)} y={STRIP_B - h} width={larg} height={h} className="pv-cheg" />;
        })}
      {!comChegadas && (
        <text x={(L + W - R) / 2} y={STRIP_T + 14} textAnchor="middle" className="pv-ocioso-t">
          sem chegadas na simulação
        </text>
      )}

      {/* fim do turno */}
      <line x1={fimX} x2={fimX} y1={T - 6} y2={B} className="pv-fim" />
      <text x={fimX - 5} y={T + 4} textAnchor="end" className="pv-fim-t">
        fim do turno 17:40
      </text>

      {/* agora */}
      {marcaAgora && (
        <g>
          <line x1={x(agora)} x2={x(agora)} y1={T} y2={B} className="pv-agora" />
          <text x={x(agora) + 4} y={B - 6} className="pv-agora-t">
            {hhmm(agora)}
          </text>
        </g>
      )}

      {/* término do p50 */}
      {xTerm !== null ? (
        <g>
          <line x1={xTerm} x2={xTerm} y1={T + 14} y2={B} className={prev.emRisco ? "pv-term pv-term--risco" : "pv-term"} />
          <circle cx={xTerm} cy={B} r={4} className={prev.emRisco ? "pv-dot pv-dot--risco" : "pv-dot"} />
          <text x={Math.min(xTerm, W - R - 24)} y={T + 12} textAnchor="middle" className={prev.emRisco ? "pv-term-t pv-term-t--risco" : "pv-term-t"}>
            {hhmm(term as number)}
          </text>
        </g>
      ) : (
        <text x={W - R - 6} y={y(p50.sobra) - 8} textAnchor="end" className="pv-nao-fecha">
          sobram {fmt.int(Math.round(p50.sobra))}
        </text>
      )}
    </svg>
  );
}
