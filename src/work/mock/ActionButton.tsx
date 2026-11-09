import type { ReactNode } from "react";
import { useSimulate } from "../../lib/useSimulate";

interface Props {
  children: string;
  /** Roda quando a ação simulada termina. */
  onDone?: () => void;
  /** Duração da simulação em ms (padrão 600). */
  ms?: number;
  icon?: ReactNode;
  style?: React.CSSProperties;
}

/** Botão de ação (.mock__action) que simula processamento: mostra "Processando..." e ignora cliques enquanto isso. */
export function ActionButton({ children, onDone, ms = 600, icon, style }: Props) {
  const { loading, label, run } = useSimulate();
  return (
    <button
      type="button"
      className={loading ? "mock__action is-loading" : "mock__action"}
      style={style}
      aria-busy={loading}
      onClick={() => run(onDone, ms)}
    >
      {icon}
      <span>{label(children)}</span>
    </button>
  );
}
