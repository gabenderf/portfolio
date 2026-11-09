import { useCallback, useState, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";

/* Um único IntersectionObserver compartilhado por todos os elementos [data-reveal]. */
const callbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          const cb = callbacks.get(en.target);
          observer?.unobserve(en.target);
          callbacks.delete(en.target);
          cb?.();
        }
      },
      { threshold: 0.18 },
    );
  }
  return observer;
}

/** Ref callback (com cleanup) + estado "já entrou na viewport". Com reduce-motion, já nasce visível. */
export function useReveal<T extends Element = HTMLElement>() {
  const [seen, setSeen] = useState(false);
  const reduce = useReducedMotion();
  const ref = useCallback((el: T | null) => {
    if (!el) return;
    const io = getObserver();
    callbacks.set(el, () => setSeen(true));
    io.observe(el);
    return () => {
      io.unobserve(el);
      callbacks.delete(el);
    };
  }, []);
  return { ref, inView: seen || reduce };
}

interface RevealProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** índice de escalonamento (--i). */
  index?: number;
  children?: ReactNode;
}

/** Elemento com [data-reveal]; recebe .is-in ao entrar na viewport. */
export function Reveal({ as: Tag = "div", index, className, style, children, ...rest }: RevealProps) {
  const { ref, inView } = useReveal<HTMLElement>();
  const st = index ? ({ ...style, "--i": index } as CSSProperties) : style;
  const cls = [className, inView ? "is-in" : ""].filter(Boolean).join(" ") || undefined;
  return (
    <Tag ref={ref} data-reveal="" className={cls} style={st} {...rest}>
      {children}
    </Tag>
  );
}
