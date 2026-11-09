import { useState } from "react";
import type { ScreenProps } from "../types";
import { ActionButton, FilterBar, Pill } from "../../work/mock";
import { CASOS, CATEGORIAS, type CategoriaCaso } from "./data";
import { PvShell } from "./Shell";

export function FalhasScreen({ go, toast }: ScreenProps) {
  const [filtro, setFiltro] = useState<"all" | CategoriaCaso>("all");
  const [sel, setSel] = useState(CASOS[0].id);
  const [reveladas, setReveladas] = useState<Set<string>>(() => new Set());

  const visiveis = CASOS.filter((c) => filtro === "all" || c.categoria === filtro);
  const atual = CASOS.find((c) => c.id === sel) ?? CASOS[0];
  const aberto = reveladas.has(atual.id);
  const comparavel = atual.parecia.num !== undefined && atual.certo.num !== undefined;
  const escala = comparavel ? Math.max(atual.parecia.num as number, atual.certo.num as number) : 1;

  const revela = (id: string) => {
    setReveladas((s) => new Set(s).add(id));
    toast("Segunda fonte consultada");
  };

  return (
    <PvShell
      ativa="falhas"
      go={go}
      title="Plausível e errado"
      controls={<Pill>{reveladas.size} de {CASOS.length} comparados</Pill>}
    >
      <FilterBar
        label="Tipo:"
        options={CATEGORIAS}
        value={filtro}
        onChange={(v) => {
          setFiltro(v);
          const primeiro = CASOS.find((c) => v === "all" || c.categoria === v);
          if (primeiro && !(atual.categoria === v || v === "all")) setSel(primeiro.id);
        }}
      />
      <div className="pv-split">
        <ul className="pv-lista" aria-label="Modos de falha">
          {visiveis.map((c) => (
            <li key={c.id}>
              <button type="button" className={c.id === atual.id ? "pv-item is-active" : "pv-item"} aria-pressed={c.id === atual.id} onClick={() => setSel(c.id)}>
                <span className="pv-item__t">{c.titulo}</span>
                <span className="pv-item__v">
                  {reveladas.has(c.id) ? (
                    <>
                      <s>{c.parecia.valor}</s> <b className="ok">{c.certo.valor}</b>
                    </>
                  ) : (
                    c.parecia.valor
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="pv-detalhe">
          <p className="k">Parecia certo</p>
          <div className="pv-num">
            <strong className={aberto ? "pv-num__v is-riscado" : "pv-num__v"}>{atual.parecia.valor}</strong>
            <span>{atual.parecia.legenda}</span>
          </div>

          {!aberto ? (
            <div className="mock__note">
              <p>Nenhum erro apareceu na tela. Como você saberia que este número está errado?</p>
              <div className="pv-acao">
                <ActionButton onDone={() => revela(atual.id)}>Comparar com a segunda fonte</ActionButton>
              </div>
            </div>
          ) : (
            <>
              <p className="k">O número certo</p>
              <div className="pv-num">
                <strong className="pv-num__v ok">{atual.certo.valor}</strong>
                <span>{atual.certo.legenda}</span>
              </div>

              {comparavel && (
                <div className="pv-barras" aria-hidden="true">
                  <div className="pv-barra">
                    <i className="pv-barra__a" style={{ width: `${((atual.parecia.num as number) / escala) * 100}%` }} />
                  </div>
                  <div className="pv-barra">
                    <i className="pv-barra__b" style={{ width: `${((atual.certo.num as number) / escala) * 100}%` }} />
                  </div>
                </div>
              )}

              <p className="k">Segunda fonte</p>
              <cite>{atual.fonte}</cite>
              <p className="pv-texto">{atual.como}</p>
              {atual.efeito && <p className="pv-efeito">Efeito: {atual.efeito}</p>}
            </>
          )}
        </div>
      </div>
    </PvShell>
  );
}
