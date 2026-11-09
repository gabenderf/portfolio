import { useEffect, useState } from "react";
import type { ScreenProps } from "../types";
import { ActionButton, FilterBar, MockShell, Pill, fmt } from "../../work/mock";
import { PEDIDOS, ROTULO, type Estado } from "./data";

type Filtro = "all" | Estado;

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ok", label: ROTULO.ok },
  { value: "wait", label: ROTULO.wait },
  { value: "bad", label: ROTULO.bad },
];

/** Master-detail com filtro (estado da tela), ação simulada, relógio com cleanup e navegação via go(). */
export function ListaScreen({ toast, go }: ScreenProps) {
  const [filtro, setFiltro] = useState<Filtro>("all");
  const [selecionado, setSelecionado] = useState(PEDIDOS[0].id);
  const [agora, setAgora] = useState(() => fmt.hora(new Date()));

  useEffect(() => {
    const t = setInterval(() => setAgora(fmt.hora(new Date())), 15000);
    return () => clearInterval(t);
  }, []);

  const visiveis = PEDIDOS.filter((p) => filtro === "all" || p.status === filtro);
  const atual = PEDIDOS.find((p) => p.id === selecionado) ?? PEDIDOS[0];

  return (
    <MockShell
      project="_exemplo"
      brand="Exemplo"
      onNav={go}
      nav={[
        { label: "Lista", active: true },
        { label: "Painel", to: "painel" },
      ]}
      title="Pedidos de hoje"
      controls={
        <>
          <ActionButton onDone={() => toast("Exemplo: auditoria concluída")}>Auditar</ActionButton>
          <Pill>{agora}</Pill>
        </>
      }
    >
      <div className="mock__split">
        <div className="mock__pane" style={{ padding: 0 }}>
          <FilterBar options={FILTROS} value={filtro} onChange={setFiltro} />
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Estado</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => (
                <tr
                  key={p.id}
                  className={p.id === atual.id ? "is-clickable is-active" : "is-clickable"}
                  onClick={() => setSelecionado(p.id)}
                >
                  <td>
                    <strong>{p.nome}</strong>
                  </td>
                  <td className={p.status}>{ROTULO[p.status]}</td>
                  <td>R$ {fmt.dec(p.valor, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mock__pane">
          <p className="k">Detalhe · {atual.nome}</p>
          <p style={{ margin: "0.45em 0 0" }}>{atual.desc}</p>
          <div className="mock__note">
            Valor: <cite>R$ {fmt.dec(atual.valor, 2)}</cite>
          </div>
          <button type="button" className="mock__action" style={{ marginTop: "0.8em" }} onClick={() => go("painel")}>
            <span>Ver painel</span>
          </button>
        </div>
      </div>
    </MockShell>
  );
}
