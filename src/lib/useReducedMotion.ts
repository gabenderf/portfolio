import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export const reducedMotionQuery = (): MediaQueryList => window.matchMedia(QUERY);

function subscribe(cb: () => void): () => void {
  const mq = reducedMotionQuery();
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, () => reducedMotionQuery().matches, () => false);
}
