import { reducedMotionQuery } from "../lib/useReducedMotion";

const SETTLE =
  "background-color var(--dur-hover) var(--ease-standard), color var(--dur-hover) var(--ease-standard), border-color var(--dur-hover) var(--ease-standard), translate 620ms var(--ease-spring)";

/** Ref callback (com cleanup): o elemento "puxa" em direção ao cursor. Respeita reduce-motion. */
function magneticRef(el: HTMLElement | null): (() => void) | void {
  if (!el) return;
  const reduce = reducedMotionQuery();
  const onMove = (e: PointerEvent) => {
    if (reduce.matches) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.translate = `${x * 0.28}px ${y * 0.34}px`;
  };
  const onLeave = () => {
    el.style.transition = SETTLE;
    el.style.translate = "";
  };
  const onEnter = () => {
    el.style.transition = "";
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  el.addEventListener("pointerenter", onEnter);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    el.removeEventListener("pointerenter", onEnter);
    el.style.translate = "";
    el.style.transition = "";
  };
}

/** Uso: <a ref={useMagnetic()} data-magnetic>. O callback é estável e vale para qualquer elemento. */
export function useMagnetic() {
  return magneticRef;
}
