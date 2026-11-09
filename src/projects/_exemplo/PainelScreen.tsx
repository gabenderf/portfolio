import type { ScreenProps } from "../types";
import { Bar, MockShell, fmt } from "../../work/mock";
import { PEDIDOS } from "./data";

export function PainelScreen({ inVisor, go }: ScreenProps) {
  const total = PEDIDOS.reduce((s, p) => s + p.valor, 0);
  const liberados = (PEDIDOS.filter((p) => p.status === "ok").length / PEDIDOS.length) * 100;
  return (
    <MockShell
      project="_exemplo"
      brand="Exemplo"
      onNav={go}
      nav={[
        { label: "Lista", to: "lista" },
        { label: "Painel", active: true },
      ]}
      title="Painel"
      controls={<span className="ok">{fmt.pct(liberados)} liberados</span>}
    >
      <div className="mock__pane">
        <p className="k">Total em pedidos</p>
        <p style={{ margin: "0.3em 0" }}>R$ {fmt.dec(total, 2)}</p>
        <Bar value={liberados} />
        <p className="mock__note">
          Esta tela pode estar no card e no visor ao mesmo tempo, cada uma com seu estado: {inVisor ? "você está no visor" : "você está no card"}.
        </p>
      </div>
    </MockShell>
  );
}
