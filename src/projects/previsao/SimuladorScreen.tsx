import { useMemo, useState } from "react";
import type { ScreenProps } from "../types";
import { FilterBar, Pill, fmt } from "../../work/mock";
import { CENARIOS, type EstadoSim } from "./data";
import { FIM_TURNO, FATORES, PASSO, INICIO_TURNO, PISO_RITMO, hhmm, prever, type Dia } from "./model";
import { FilaChart } from "./FilaChart";
import { Campo, PvShell } from "./Shell";

const DIAS: { value: Dia; label: string }[] = [
  { value: "seg", label: "Seg" },
  { value: "ter", label: "Ter" },
  { value: "qua", label: "Qua" },
  { value: "qui", label: "Qui" },
  { value: "sex", label: "Sex" },
];

function folga(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${m} min`;
}

export function SimuladorScreen({ go }: ScreenProps) {
  const [presetId, setPresetId] = useState<string | null>(CENARIOS[0].id);
  const [s, setS] = useState<EstadoSim>(CENARIOS[0].estado);

  const muda = (p: Partial<EstadoSim>) => {
    setS((v) => ({ ...v, ...p }));
    setPresetId(null);
  };
  const aplica = (id: string) => {
    const c = CENARIOS.find((x) => x.id === id);
    if (!c) return;
    setS(c.estado);
    setPresetId(c.id);
  };

  const prev = useMemo(() => prever({ ...s, projetar: s.chegadas }), [s]);
  const preset = CENARIOS.find((c) => c.id === presetId) ?? null;
  const term = prev.p50.termino;
  const p90 = prev.p90.termino;
  const tudo = prev.tudo.termino;

  let status: { tom: "ok" | "wait" | "bad"; texto: string };
  if (term === null) {
    status = { tom: "bad", texto: `Não fecha no turno: sobram ${fmt.int(Math.round(prev.p50.sobra))} pedidos obrigatórios às 17:40.` };
  } else if (prev.emRisco) {
    status = {
      tom: "wait",
      texto: `Em risco: término ${hhmm(term)}, depois do fim do turno. O motor ainda devolve fecha = true, porque o laço inclui o passo das 17:40 e o crédito vai para o fim do passo.`,
    };
  } else {
    status = {
      tom: "ok",
      texto: `Fecha até 17:40, com ${folga(FIM_TURNO - term)} de folga e ${fmt.dec(prev.p50.ociosasHorasPessoa)} h-pessoa de capacidade ociosa.`,
    };
  }

  const confere = preset && preset.esperado && term !== null && hhmm(term) === preset.esperado;

  return (
    <PvShell
      ativa="simulador"
      go={go}
      title="Simulador de término"
      controls={<Pill tone={status.tom}>{term === null ? "não fecha" : prev.emRisco ? "em risco" : "fecha"}</Pill>}
    >
      <div className="pv-cenarios">
        <FilterBar
          options={CENARIOS.map((c) => ({ value: c.id, label: c.label }))}
          label="Cenários:"
          value={presetId ?? ""}
          onChange={aplica}
        />
      </div>
      {preset && (
        <p className="pv-preset">
          {preset.descricao}{" "}
          {confere ? (
            <span className="ok">Confere com o motor real: {preset.esperado}.</span>
          ) : preset.esperado === null ? (
            <span className="pv-mudo">Valor derivado da fórmula.</span>
          ) : null}
        </p>
      )}

      <div className="pv-sim">
        <div className="pv-sim__res">
          <div className="pv-kpis">
            <div className="pv-kpi">
              <span className="k">Término p50</span>
              <strong className={term === null ? "bad" : prev.emRisco ? "wait" : "ok"}>{term === null ? "não fecha" : hhmm(term)}</strong>
              <small>horário publicado</small>
            </div>
            <div className="pv-kpi">
              <span className="k">Pessimista p90</span>
              <strong>{p90 === null ? "não fecha" : hhmm(p90)}</strong>
              <small>ritmo × 0,75 = {fmt.dec(s.ritmo * 0.75)}/h</small>
            </div>
            <div className="pv-kpi">
              <span className="k">Ritmo necessário</span>
              <strong>{fmt.dec(prev.ritmoNecessario)}/h</strong>
              <small>{prev.noPiso ? `piso de ${PISO_RITMO}/h (conta daria ${fmt.dec(prev.ritmoNecessarioBruto)})` : "por pessoa, para fechar"}</small>
            </div>
            <div className="pv-kpi">
              <span className="k">Fila inteira</span>
              <strong>{tudo === null ? "não fecha" : hhmm(tudo)}</strong>
              <small>para zerar tudo: {fmt.dec(prev.ritmoParaZerarTudo)}/h</small>
            </div>
          </div>

          <FilaChart prev={prev} agora={s.agora} comChegadas={s.chegadas} />

          <ul className="pv-legenda" aria-label="Legenda do gráfico">
            <li><i className="pv-sw pv-sw--p50" />obrigatório, p50</li>
            <li><i className="pv-sw pv-sw--p90" />p90</li>
            {s.chegadas && <li><i className="pv-sw pv-sw--tudo" />fila inteira com chegadas</li>}
          </ul>
          <p className={`pv-status ${status.tom}`}>{status.texto}</p>
        </div>

        <div className="pv-sim__ctl">
          <Campo label="Pessoas" valor={String(s.pessoas)} min={1} max={6} step={1} value={s.pessoas} onChange={(v) => muda({ pessoas: v })} />
          <Campo label="Ritmo por pessoa" valor={`${s.ritmo}/h`} min={20} max={60} step={1} value={s.ritmo} onChange={(v) => muda({ ritmo: v })} />
          <Campo
            label="Obrigatórios"
            valor={fmt.int(s.obrigatorios)}
            min={0}
            max={1400}
            step={5}
            value={s.obrigatorios}
            onChange={(v) => muda({ obrigatorios: v })}
          />
          <Campo
            label="Para depois"
            valor={fmt.int(s.adiantamento)}
            min={0}
            max={800}
            step={10}
            value={s.adiantamento}
            onChange={(v) => muda({ adiantamento: v })}
          />
          <Campo
            label="Hora do relógio"
            valor={hhmm(s.agora)}
            min={INICIO_TURNO}
            max={16 * 60 + 55}
            step={PASSO}
            value={s.agora}
            onChange={(v) => muda({ agora: v })}
          />
          <div className="pv-campo">
            <span className="pv-campo__top">
              <span>Dia da semana</span>
              <b>fator {fmt.dec(FATORES[s.dia], 3)}</b>
            </span>
            <FilterBar label="" options={DIAS} value={s.dia} onChange={(v) => muda({ dia: v })} />
          </div>
          <div className="pv-campo">
            <span className="pv-campo__top">
              <span>Chegadas previstas</span>
              <b>{s.chegadas ? `${fmt.int(prev.chegadasRestantes)} restantes` : "fora"}</b>
            </span>
            <FilterBar
              label=""
              options={[
                { value: "nao", label: "Não" },
                { value: "sim", label: "Pela curva" },
              ]}
              value={s.chegadas ? "sim" : "nao"}
              onChange={(v) => muda({ chegadas: v === "sim" })}
            />
          </div>
        </div>
      </div>
    </PvShell>
  );
}
