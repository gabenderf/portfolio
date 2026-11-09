import { useMemo, useState, type KeyboardEvent } from "react";
import type { ScreenProps } from "../types";
import { FilterBar, Pill, fmt } from "../../work/mock";
import { DIAS, FATOR_GLOBAL } from "./data";
import { CURVA, hm, prever } from "./model";
import { PvShell } from "./Shell";

type Modo = "fator" | "curva";

const W = 600;
const H = 232;
const L = 44;
const R = 12;
const T = 16;
const B = 192;

function tecla(fn: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  };
}

const HORAS = Object.keys(CURVA).map(Number);
const SOMA = HORAS.reduce((s, h) => s + CURVA[h], 0);

export function CalibracaoScreen({ go }: ScreenProps) {
  const [modo, setModo] = useState<Modo>("fator");
  const [dia, setDia] = useState(DIAS[1].dia);
  const [hora, setHora] = useState(10);

  const d = DIAS.find((x) => x.dia === dia) ?? DIAS[1];

  // 1.012 pedidos visíveis às 07:59 (cenário do briefing), com o fator do dia escolhido
  const exemplo = useMemo(
    () => prever({ agora: hm(7, 59), pessoas: 3, ritmo: 35, obrigatorios: 640, adiantamento: 372, dia, projetar: true }),
    [dia],
  );
  const terca = useMemo(
    () => prever({ agora: hm(7, 59), pessoas: 3, ritmo: 35, obrigatorios: 640, adiantamento: 372, dia: "ter", projetar: true }),
    [],
  );
  const chegadasNaHora = (h: number) => {
    let s = 0;
    for (const [t, v] of terca.chegadasPorPasso) if (Math.floor(t / 60) === h) s += v;
    // Entre 08:00 e 08:30 a produção ainda não começou: essas chegadas viram fila inicial.
    if (h === 8) s += terca.chegadasIniciais;
    return Math.round(s);
  };

  const n = modo === "fator" ? DIAS.length : HORAS.length;
  const slot = (W - L - R) / n;
  const bw = slot * 0.56;
  const ymax = modo === "fator" ? 1.6 : 25;
  const y = (v: number) => B - (v / ymax) * (B - T);
  const ticks = modo === "fator" ? [0, 0.5, 1, 1.5] : [0, 10, 20];

  return (
    <PvShell
      ativa="calibracao"
      go={go}
      title="Calibração com 15.000 pedidos"
      controls={<Pill>21/07 a 15/08/2026</Pill>}
    >
      <FilterBar
        label="Ver:"
        options={[
          { value: "fator", label: "Fator por dia" },
          { value: "curva", label: "Curva de chegada" },
        ]}
        value={modo}
        onChange={setModo}
      />
      <div className="pv-cal">
        <svg
          className="pv-chart pv-chart--bars"
          viewBox={`0 0 ${W} ${H}`}
          role="group"
          aria-label={modo === "fator" ? "Fator de projeção às 7h40 por dia da semana" : "Curva de chegada da manhã por hora"}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="pv-grid" />
              <text x={L - 6} y={y(t) + 4} textAnchor="end" className="pv-tick">
                {modo === "fator" ? fmt.dec(t, 1) : `${t}%`}
              </text>
            </g>
          ))}
          {modo === "fator" && (
            <g>
              <line x1={L} x2={W - R} y1={y(FATOR_GLOBAL.valor)} y2={y(FATOR_GLOBAL.valor)} className="pv-global" />
              <text x={L + 4} y={y(FATOR_GLOBAL.valor) - 5} textAnchor="start" className="pv-global-t">
                fator único {fmt.dec(FATOR_GLOBAL.valor, 3)} (CV {FATOR_GLOBAL.cv})
              </text>
            </g>
          )}

          {modo === "fator"
            ? DIAS.map((x, i) => {
                const cx = L + slot * i + slot / 2;
                const on = x.dia === dia;
                const pick = () => setDia(x.dia);
                return (
                  <g key={x.dia} className={on ? "pv-bar is-sel" : "pv-bar"} role="button" tabIndex={0} aria-pressed={on} aria-label={`${x.label}: fator ${fmt.dec(x.fator, 3)}`} onClick={pick} onKeyDown={tecla(pick)}>
                    <rect x={cx - slot / 2} y={T} width={slot} height={B - T} className="pv-hit" />
                    <rect x={cx - bw / 2} y={y(x.fator)} width={bw} height={B - y(x.fator)} rx={4} className="pv-bar__r" />
                    <text x={cx} y={y(x.fator) - 6} textAnchor="middle" className="pv-bar__v">
                      {fmt.dec(x.fator, 3)}
                    </text>
                    <text x={cx} y={B + 20} textAnchor="middle" className="pv-tick pv-tick--b">
                      {x.label}
                    </text>
                  </g>
                );
              })
            : HORAS.map((h, i) => {
                const cx = L + slot * i + slot / 2;
                const on = h === hora;
                const pick = () => setHora(h);
                const p = CURVA[h];
                return (
                  <g key={h} className={on ? "pv-bar is-sel" : "pv-bar"} role="button" tabIndex={0} aria-pressed={on} aria-label={`${h}h: ${p}% da curva`} onClick={pick} onKeyDown={tecla(pick)}>
                    <rect x={cx - slot / 2} y={T} width={slot} height={B - T} className="pv-hit" />
                    <rect x={cx - bw / 2} y={y(p)} width={bw} height={B - y(p)} rx={4} className="pv-bar__r" />
                    <text x={cx} y={y(p) - 6} textAnchor="middle" className="pv-bar__v">
                      {p}%
                    </text>
                    <text x={cx} y={B + 20} textAnchor="middle" className="pv-tick pv-tick--b">
                      {String(h).padStart(2, "0")}h
                    </text>
                  </g>
                );
              })}
        </svg>

        <div className="pv-detalhe">
          {modo === "fator" ? (
            <>
              <p className="k">{d.label} · fator às 7h40</p>
              <div className="pv-num">
                <strong className="pv-num__v">{fmt.dec(d.fator, 3)}</strong>
                <span>desvio {d.desvio}</span>
              </div>
              <p className="pv-texto">{d.nota}</p>
              <p className="pv-texto">
                Volume típico: {d.volume}. Com 1.012 pedidos visíveis às 07:59, o volume previsto seria <b>{fmt.int(exemplo.volumePrevisto)}</b>
                {exemplo.chegadasRestantes > 0 ? ` (${fmt.int(exemplo.chegadasRestantes)} chegadas restantes)` : " (nenhuma chegada futura)"}.
              </p>
              <p className="pv-aviso">O fator único engana: a variação vem de misturar dias estruturalmente diferentes. Por isso o fator é por dia da semana.</p>
            </>
          ) : (
            <>
              <p className="k">{String(hora).padStart(2, "0")}h · peso na curva</p>
              <div className="pv-num">
                <strong className="pv-num__v">{CURVA[hora]}%</strong>
                <span>normalizado: {fmt.dec((CURVA[hora] / SOMA) * 100, 1)}% das chegadas restantes</span>
              </div>
              <p className="pv-texto">
                Na terça das 07:59, as {fmt.int(terca.chegadasRestantes)} chegadas restantes se repartem pela curva: {fmt.int(chegadasNaHora(hora))} chegam entre {String(hora).padStart(2, "0")}h e {String(hora + 1).padStart(2, "0")}h, em passos de 5 minutos.
                {hora === 8
                  ? ` Destas, ${fmt.int(Math.round(terca.chegadasIniciais))} caem antes das 08:30 e viram fila inicial.`
                  : " O que cai antes das 08:30 vira fila inicial."}
              </p>
              <p className="pv-aviso">O pago até 13h sai no mesmo dia e entra às 12h59: o piso pós-almoço emerge da curva, sem número mágico no código.</p>
            </>
          )}
        </div>
      </div>

      <div className="mock__note">
        <b>Calibração em vez de precisão inicial.</b> Um padrão de uso contaminava o histórico anterior a 15/08/2026, então o projeto não tentou derivar o parâmetro
        perfeito. O registro de previsto contra realizado é a peça central, e o modelo converge com ele.
      </div>
    </PvShell>
  );
}
