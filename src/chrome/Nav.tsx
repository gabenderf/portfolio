import { useEffect, useRef, useState } from "react";
import { site } from "../content/site";
import { reducedMotionQuery } from "../lib/useReducedMotion";
import { Btn } from "./Btn";

const SPY_IDS = ["topo", "trabalho", "plataforma", "como-trabalho", "principios", "contato"];

export function Nav() {
  const { nav } = site;
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("topo");
  const [meta, setMeta] = useState(nav.brandMeta);
  const shuffleTimer = useRef(0);
  const shuffleStop = useRef(0);

  // scroll spy
  useEffect(() => {
    let tick = false;
    const mark = () => {
      tick = false;
      const y = window.scrollY + 140;
      let cur = "topo";
      for (const id of SPY_IDS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setCurrent(cur);
    };
    const onScroll = () => {
      if (!tick) {
        tick = true;
        requestAnimationFrame(mark);
      }
    };
    mark();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // limpeza do efeito "embaralhar" da marca
  useEffect(
    () => () => {
      clearInterval(shuffleTimer.current);
      clearTimeout(shuffleStop.current);
    },
    [],
  );

  const shuffle = () => {
    if (reducedMotionQuery().matches) return;
    clearInterval(shuffleTimer.current);
    clearTimeout(shuffleStop.current);
    const original = nav.brandMeta;
    const chars = "01";
    shuffleTimer.current = window.setInterval(() => {
      setMeta([...original].map((ch) => (ch === " " || ch === "·" ? ch : chars[(Math.random() * 2) | 0])).join(""));
    }, 60);
    shuffleStop.current = window.setTimeout(() => {
      clearInterval(shuffleTimer.current);
      setMeta(original);
    }, 420);
  };

  // Menu mobile: fecha com Esc ou toque fora do cabeçalho.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest(".site-nav")) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const linkProps = (href: string) => ({
    href,
    "aria-current": current === href.slice(1) ? ("true" as const) : undefined,
  });

  return (
    <header className="site-nav">
      <a className="brand" href="#topo" onPointerEnter={shuffle}>
        <span className="brand__name">{nav.brandName}</span>
        <span className="brand__meta t-micro">{meta}</span>
      </a>
      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="nav-panel"
        onClick={() => setOpen((o) => !o)}
      >
        {nav.menuLabel}
      </button>
      <nav
        className={open ? "nav-panel is-open" : "nav-panel"}
        id="nav-panel"
        aria-label={nav.sectionsLabel}
        onClick={(e) => {
          if ((e.target as Element).closest("a")) setOpen(false);
        }}
      >
        {nav.links.map((l) => (
          <a key={l.href} className="nav-link" {...linkProps(l.href)}>
            {l.label}
          </a>
        ))}
        <Btn variant="white" icon="arrow" magnetic {...linkProps(nav.cta.href)}>
          {nav.cta.label}
        </Btn>
      </nav>
    </header>
  );
}
