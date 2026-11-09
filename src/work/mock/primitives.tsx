import type { ReactNode } from "react";
import { useToast } from "../../chrome/Toast";

/** Etiqueta com borda fina (contador, estado). `tone` aplica .ok/.wait/.bad. */
export function Pill({ tone, children }: { tone?: "ok" | "wait" | "bad"; children: ReactNode }) {
  return <span className={tone ? `pill ${tone}` : "pill"}>{children}</span>;
}

/** Barra de progresso. `value` em 0..100; `color` opcional (CSS) para o preenchimento. */
export function Bar({ value, color }: { value: number; color?: string }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <div className="bar">
      <i style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

/** Texto clicável que mostra toast "Âncora inspecionada: ..." (substitui o antigo handler de .mock__hotspot). */
export function Hotspot({ anchor, children }: { anchor?: string; children: string }) {
  const toast = useToast();
  return (
    <span
      className="mock__hotspot"
      role="button"
      tabIndex={0}
      onClick={() => toast(`Âncora inspecionada: ${anchor ?? children}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toast(`Âncora inspecionada: ${anchor ?? children}`);
        }
      }}
    >
      {children}
    </span>
  );
}
