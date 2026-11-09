import { useCallback, useEffect, useRef, useState } from "react";

export const LOADING_LABEL = "Processando...";

/**
 * Equivalente de simulate(): estado de loading + rótulo "Processando...".
 * O timer é cancelado quando o componente desmonta (nenhum callback roda em tela desmontada).
 *
 *   const { loading, label, run } = useSimulate();
 *   <button onClick={() => run(() => toast("Pronto"))}>{label("Auditar")}</button>
 */
export function useSimulate() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
      busy.current = false;
    },
    [],
  );

  const run = useCallback((fn?: () => void, ms = 600) => {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      busy.current = false;
      setLoading(false);
      if (fn) {
        try {
          fn();
        } catch (err) {
          console.error("[Portfolio] erro em useSimulate().run", err);
        }
      }
    }, ms);
  }, []);

  const label = useCallback((original: string) => (loading ? LOADING_LABEL : original), [loading]);

  return { loading, label, run };
}
