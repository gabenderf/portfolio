import { useEffect } from "react";

/**
 * Spotlight global: atualiza --mx/--my de todo .spotlight (inclusive cards gerados e o painel do visor)
 * a partir de um único listener. Os retângulos ficam em cache e são invalidados por scroll/resize/DOM.
 */
export function useSpotlight() {
  useEffect(() => {
    let rects: { el: HTMLElement; r: DOMRect }[] = [];
    let dirty = true;
    const refresh = () => {
      rects = Array.from(document.querySelectorAll<HTMLElement>(".spotlight")).map((el) => ({
        el,
        r: el.getBoundingClientRect(),
      }));
      dirty = false;
    };
    const mark = () => {
      dirty = true;
    };
    const onMove = (e: PointerEvent) => {
      if (dirty) refresh();
      for (const s of rects) {
        s.el.style.setProperty("--mx", e.clientX - s.r.left + "px");
        s.el.style.setProperty("--my", e.clientY - s.r.top + "px");
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", refresh, { passive: true });
    window.addEventListener("resize", mark, { passive: true });
    // capture: pega também o scroll interno do visor
    document.addEventListener("scroll", mark, { passive: true, capture: true });
    document.addEventListener("transitionend", mark, true);
    document.addEventListener("toggle", mark, true);
    document.addEventListener("close", mark, true);
    const mo = new MutationObserver(mark);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", refresh);
      window.removeEventListener("resize", mark);
      document.removeEventListener("scroll", mark, true);
      document.removeEventListener("transitionend", mark, true);
      document.removeEventListener("toggle", mark, true);
      document.removeEventListener("close", mark, true);
      mo.disconnect();
    };
  }, []);
}
