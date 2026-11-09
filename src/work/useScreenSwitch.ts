import { useCallback, useEffect, useRef } from "react";
import { withViewTransition } from "./viewTransition";

/**
 * Troca de tela com View Transition (quando disponível). Devolve o ref do .frame__view
 * (que recebe o view-transition-name "screen") e `select(id)`, usado pelas abas e por `go()`.
 *
 * `latest` guarda o último id pedido: cliques rápidos (antes de o React aplicar o estado) comparam
 * com o pedido mais recente, não com o `current` do último render.
 */
export function useScreenSwitch(current: string, onChange: (screenId: string) => void) {
  const viewRef = useRef<HTMLDivElement>(null);
  const latest = useRef(current);
  useEffect(() => {
    latest.current = current;
  }, [current]);

  const select = useCallback(
    (id: string) => {
      if (id === latest.current) return;
      latest.current = id;
      withViewTransition(() => onChange(id), { before: [[viewRef.current, "screen"]] });
    },
    [onChange],
  );
  return { viewRef, select };
}
