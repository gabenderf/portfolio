import { useEffect, useMemo, useState } from "react";
import type { ScreenProps } from "../types";
import { MockShell, Pill, fmt } from "../../work/mock";
import { SNAPSHOTS_DO_DIA, pedidoDe, type LinhaSnapshot } from "./data";
import {
  ETAPA_ROTULO,
  MOTIVO_ROTULO,
  PARAMS,
  SEM_FALHAS,
  explicarSnapshot,
  simularRodada,
  type Falhas,
  type Quadro,
  type Rodada,
  type Status,
} from "./model";

const TOM_STATUS: Record<Status, "ok" | "wait" | "bad"> = { ok: "ok", incompleto: "wait", erro: "bad" };

type Interruptor = "janelaCoberta" | "subAbaErrada" | "listaNaoTermina" | "pedidosSaindo" | "sessaoExpirada";
const INTERRUPTORES: { chave: Interruptor; rotulo: string; dica: string }[] = [
  { chave: "janelaCoberta", rotulo: "Janela coberta", dica: "A janela de raspagem fica oculta e o Chrome congela a renderização." },
  { chave: "subAbaErrada", rotulo: "Sub-aba errada", dica: 'A sub-aba "Todos" não existe e a tela abre na padrão.' },
  { chave: "listaNaoTermina", rotulo: "Lista não termina de carregar", dica: "A lista para de entregar linhas antes do total." },
  { chave: "pedidosSaindo", rotulo: "Pedidos saindo da lista", dica: "A liderança move pedidos de etapa durante a raspagem." },
  { chave: "sessaoExpirada", rotulo: "Sessão expirada", dica: "O login do UpSeller venceu." },
];

interface Execucao {
  rodada: Rodada;
  falhas: Falhas;
  id: string;
  hora: string;
  gravado: boolean;
}

const OCIOSO: Quadro = {
  etapa: "para_enviar",
  subAba: "Todos",
  pagina: 1,
  totalPaginas: 1,
  total: null,
  capturado: 0,
  capturadoPagina: 0,
  alvoPagina: null,
  novas: 0,
  linhas: [],
  oculta: false,
  passo: 0,
  evento: 'Pronto. Ligue falhas se quiser e clique em "Iniciar rodada".',
  tom: "",
};

export function RodadaScreen({ reduceMotion }: ScreenProps) {
  const [falhas, setFalhas] = useState<Falhas>(SEM_FALHAS);
  const [exec, setExec] = useState<Execucao | null>(null);
  const [idx, setIdx] = useState(0);
  const [tocando, setTocando] = useState(false);
  const [rapido, setRapido] = useState(false);
  const [tabela, setTabela] = useState<LinhaSnapshot[]>(SNAPSHOTS_DO_DIA);
  const [n, setN] = useState(0);

  const ultimo = exec ? exec.rodada.quadros.length - 1 : 0;
  const terminou = exec !== null && idx >= ultimo;
  const q: Quadro = exec ? exec.rodada.quadros[Math.min(idx, ultimo)] : OCIOSO;

  // avanço automático
  useEffect(() => {
    if (!tocando || !exec) return;
    const passos = rapido ? 20 : 5;
    const t = setInterval(() => setIdx((i) => Math.min(i + passos, ultimo)), 80);
    return () => clearInterval(t);
  }, [tocando, rapido, exec, ultimo]);

  // ao chegar no fim: para o timer e grava na tabela de rodadas
  useEffect(() => {
    if (!exec || idx < ultimo) return;
    setTocando(false);
    if (exec.gravado) return;
    const novas: LinhaSnapshot[] = exec.rodada.snapshots.map((s) => ({
      rodada: exec.id,
      hora: exec.hora,
      etapa: s.etapa,
      status: s.status,
      capturado: s.capturado,
      esperado: s.esperado,
      paginas: s.paginas,
      motivo: s.motivo,
    }));
    setTabela((t) => [...novas.reverse(), ...t].slice(0, 12));
    setExec({ ...exec, gravado: true });
  }, [idx, ultimo, exec]);

  const iniciar = () => {
    const minutos = (11 * 60 + 20 * n) % (24 * 60);
    const hora = fmt.hora(minutos);
    const rodada = simularRodada(falhas);
    setN(n + 1);
    setExec({ rodada, falhas, id: `20261110-${hora.replace(":", "")}`, hora, gravado: false });
    if (reduceMotion) {
      setIdx(rodada.quadros.length - 1);
      setTocando(false);
    } else {
      setIdx(0);
      setTocando(true);
    }
  };

  const alternar = (c: Interruptor) => setFalhas((f) => ({ ...f, [c]: !f[c] }));
  const emAndamento = exec !== null && !terminou;

  const feitos = useMemo(
    () => (exec ? exec.rodada.quadros.slice(0, idx + 1).filter((x) => x.fim).map((x) => x.fim!) : []),
    [exec, idx],
  );

  const alvo = q.alvoPagina ?? 0;
  const paginas = Array.from({ length: q.totalPaginas }, (_, i) => {
    const p = i + 1;
    if (p < q.pagina) return 100;
    if (p === q.pagina) return alvo > 0 ? Math.min(100, (q.capturadoPagina / alvo) * 100) : 0;
    return 0;
  });
  const thumb = alvo > 0 ? Math.min(1, q.capturadoPagina / alvo) : 0;
  const total = q.total;
  const pct = total ? Math.min(100, (q.capturado / total) * 100) : 0;

  return (
    <MockShell
      project="coletor"
      brand="Coletor"
      nav={[{ label: "Rodada", active: true }]}
      title="Rodada de raspagem"
      controls={
        <>
          <button type="button" className="mock__action" onClick={iniciar} disabled={emAndamento && tocando}>
            {exec && terminou ? "Nova rodada" : "Iniciar rodada"}
          </button>
          {emAndamento ? (
            <>
              <button type="button" className="mock__filter-btn" onClick={() => setTocando((t) => !t)}>
                {tocando ? "Pausar" : "Continuar"}
              </button>
              <button
                type="button"
                className="mock__filter-btn"
                onClick={() => setIdx((i) => Math.min(i + 1, ultimo))}
                disabled={tocando}
              >
                Passo
              </button>
            </>
          ) : null}
        </>
      }
    >
      <div className="cl__body">
        <div className="cl__falhas" role="group" aria-label="Falhas a injetar na próxima rodada">
          <span className="k">Falhas</span>
          {INTERRUPTORES.map((i) => (
            <button
              key={i.chave}
              type="button"
              role="switch"
              aria-checked={falhas[i.chave]}
              title={i.dica}
              className={`cl__chip${falhas[i.chave] ? " is-on" : ""}`}
              disabled={emAndamento}
              onClick={() => alternar(i.chave)}
            >
              {i.rotulo}
            </button>
          ))}
          <span className="cl__chegadas" role="group" aria-label="Pedidos que chegam durante a leitura">
            <span className="k">Chegadas</span>
            {([0, 3, 4] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={falhas.chegadas === v}
                className={`cl__chip${falhas.chegadas === v ? " is-on" : ""}`}
                disabled={emAndamento}
                onClick={() => setFalhas((f) => ({ ...f, chegadas: v }))}
              >
                {v === 0 ? "nenhuma" : `+${v}`}
              </button>
            ))}
          </span>
        </div>

        <div className="cl__grid">
          <div className="cl__ux">
            <div className="cl__ux-head">
              <span>
                <strong>{ETAPA_ROTULO[q.etapa]}</strong> <cite>{q.subAba}</cite>
              </span>
              <span className="k">{q.linhas.length} linhas no DOM</span>
            </div>
            <div className={`cl__viewport${q.oculta ? " is-oculta" : ""}`}>
              <ul className="cl__rows" aria-label="Linhas visíveis da lista">
                {Array.from({ length: PARAMS.JANELA_LINHAS }, (_, i) => {
                  const l = q.linhas[i];
                  if (!l) return <li key={`v${i}`} className="cl__row is-vazia" aria-hidden="true" />;
                  const p = pedidoDe(q.etapa, l.pos);
                  return (
                    <li key={l.pos} className={`cl__row${l.novo ? " is-novo" : ""}`}>
                      <cite>{p.num}</cite>
                      <span className="cl__sku">{p.sku}</span>
                      <span className="cl__prazo">{p.prazo}</span>
                    </li>
                  );
                })}
              </ul>
              <div className="cl__trilho" aria-hidden="true">
                <i style={{ top: `${thumb * 78}%` }} />
              </div>
              {q.oculta ? <div className="cl__cobertura">janela oculta</div> : null}
            </div>
            <div className="cl__rodape">
              Total <strong>{total ?? "–"}</strong> · {q.pagina}/{q.totalPaginas} · {PARAMS.POR_PAGINA}/página
            </div>
          </div>

          <div className="cl__acc">
            <p className="k">Acumulado (deduplicado pelo nº do pedido)</p>
            <p className="cl__num">
              {fmt.int(q.capturado)}
              <span> / {total === null ? "–" : fmt.int(total)}</span>
            </p>
            <div className="bar" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </div>
            <div className="cl__paginas" aria-hidden="true">
              {paginas.map((w, i) => (
                <span key={i}>
                  <i style={{ width: `${w}%` }} />
                </span>
              ))}
            </div>
            <p className="cl__meta">
              página {q.pagina}/{q.totalPaginas} · alvo da página {q.alvoPagina ?? "–"}
              <br />
              passo {q.passo} · <span className={q.novas > 0 ? "ok" : ""}>+{q.novas} novas</span>
            </p>
            {feitos.length > 0 ? (
              <ul className="cl__feitos">
                {feitos.map((s) => (
                  <li key={s.etapa}>
                    {ETAPA_ROTULO[s.etapa]}{" "}
                    <b className={TOM_STATUS[s.status]}>
                      {s.capturado}/{s.esperado ?? "–"}
                    </b>{" "}
                    <Pill tone={TOM_STATUS[s.status]}>{s.status}</Pill>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <p className={`cl__log${q.tom ? ` ${q.tom}` : ""}`}>{q.evento}</p>

        {exec && terminou ? (
          <div className="cl__resultado">
            {exec.rodada.snapshots.map((s) => (
              <div key={s.etapa} className={`mock__note cl__nota cl__nota--${TOM_STATUS[s.status]}`}>
                <strong>
                  {ETAPA_ROTULO[s.etapa]}: {s.status}
                </strong>{" "}
                <cite>{MOTIVO_ROTULO[s.motivo]}</cite>
                <br />
                {explicarSnapshot(s, exec.falhas)}
              </div>
            ))}
            {exec.rodada.perdidos > 0 ? (
              <p className="cl__oculto">
                Perdidos que a conferência não vê: <b>{exec.rodada.perdidos}</b> pedidos
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="cl__tabela">
          <p className="k">
            fila_snapshots · rodadas de 10/11/2026{" "}
            <button
              type="button"
              className="cl__vel"
              aria-pressed={rapido}
              onClick={() => setRapido((r) => !r)}
              title="Velocidade da animação"
            >
              {rapido ? "velocidade 4x" : "velocidade 1x"}
            </button>
          </p>
          <div className="cl__scroll">
            <table>
              <thead>
                <tr>
                  <th>Rodada</th>
                  <th>Etapa</th>
                  <th>Status</th>
                  <th>Capt./esp.</th>
                  <th>Pág.</th>
                  <th>Motivo da parada</th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((r, i) => (
                  <tr key={`${r.rodada}-${r.etapa}-${i}`}>
                    <td>{r.hora}</td>
                    <td>{ETAPA_ROTULO[r.etapa]}</td>
                    <td className={TOM_STATUS[r.status]}>{r.status}</td>
                    <td>
                      {r.capturado}/{r.esperado ?? "–"}
                    </td>
                    <td>{r.paginas}</td>
                    <td className={r.motivo === "total_atingido" ? "" : TOM_STATUS[r.status]}>{MOTIVO_ROTULO[r.motivo]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MockShell>
  );
}
