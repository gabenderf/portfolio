import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type ToastFn = (msg: string) => void;
const ToastContext = createContext<ToastFn | null>(null);

const DURATION = 1600;

/** Provider + elemento visual do toast (role=status). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [text, setText] = useState("");
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const toast = useCallback<ToastFn>((msg) => {
    setText(msg);
    setOn(true);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), DURATION);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={on ? "toast is-on" : "toast"} role="status" aria-live="polite">
        {text}
      </div>
    </ToastContext.Provider>
  );
}

/** Retorna toast(msg), estável entre renders. */
export function useToast(): ToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast precisa estar dentro de <ToastProvider>");
  return ctx;
}
