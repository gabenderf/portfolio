import { flushSync } from "react-dom";
import { reducedMotionQuery } from "../lib/useReducedMotion";

/* Controle de View Transitions: no máximo uma ativa; nomes limpos só pela transição dona deles. */

interface VTLike {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition(): void;
}
type StartVT = (cb: () => void | Promise<void>) => VTLike;

type Named = [el: HTMLElement | null | undefined, name: string];

interface Options {
  /** Elementos que recebem view-transition-name antes de capturar o estado antigo. */
  before?: Named[];
  /** Nomes a limpar logo antes do update (ex.: o card de origem do visor). */
  clearBeforeUpdate?: (HTMLElement | null | undefined)[];
  /** Elementos que recebem nome depois do update (estado novo). */
  after?: () => Named[];
}

interface Entry {
  vt: VTLike | null;
  cleanup: () => void;
  dead: boolean;
}
let current: Entry | null = null;
/** Dono atual do view-transition-name de cada elemento: só o dono limpa o nome. */
const owner = new WeakMap<HTMLElement, Entry>();

function startVT(): StartVT | null {
  const fn = (document as unknown as { startViewTransition?: StartVT }).startViewTransition;
  return typeof fn === "function" ? fn.bind(document) : null;
}

export function canTransition(): boolean {
  return !reducedMotionQuery().matches && startVT() !== null;
}

/**
 * Roda `update` (mudança de estado do React) dentro de uma View Transition quando possível.
 * O update é aplicado com flushSync para o DOM novo existir quando o navegador captura o "depois".
 * Sem suporte, ou com reduce-motion, só roda `update`.
 */
export function withViewTransition(update: () => void, opts: Options = {}): void {
  const start = startVT();
  if (!start || reducedMotionQuery().matches) {
    update();
    return;
  }

  // Uma transição nova sempre pula a anterior e herda seus nomes limpos (evita nomes duplicados).
  if (current) {
    const prev = current;
    current = null;
    prev.dead = true;
    try {
      prev.vt?.skipTransition();
    } catch {
      /* já terminou */
    }
    prev.cleanup();
  }

  const touched = new Set<HTMLElement>();
  const entry: Entry = { vt: null, cleanup: () => {}, dead: false };
  const apply = (list: Named[]) => {
    for (const [el, name] of list) {
      if (!el) continue;
      el.style.viewTransitionName = name;
      owner.set(el, entry);
      touched.add(el);
    }
  };
  // Idempotente; só limpa elementos que ainda pertencem a esta transição.
  const cleanup = () => {
    touched.forEach((el) => {
      if (owner.get(el) === entry) {
        el.style.viewTransitionName = "";
        owner.delete(el);
      }
    });
    touched.clear();
  };
  entry.cleanup = cleanup;
  apply(opts.before ?? []);

  let vt: VTLike;
  try {
    vt = start(() => {
      // Se outra transição já assumiu, só aplica o estado; não mexe em nomes.
      if (!entry.dead) {
        opts.clearBeforeUpdate?.forEach((el) => {
          if (el && (!owner.has(el) || owner.get(el) === entry)) el.style.viewTransitionName = "";
        });
      }
      flushSync(update);
      if (opts.after && !entry.dead) apply(opts.after());
    });
  } catch (err) {
    console.error("[Portfolio] startViewTransition falhou", err);
    cleanup();
    update();
    return;
  }

  entry.vt = vt;
  current = entry;
  // AbortError/InvalidStateError de transições puladas não podem vazar como "unhandled rejection".
  vt.ready.catch(() => {});
  vt.updateCallbackDone.catch(() => {});
  vt.finished
    .catch(() => {})
    .finally(() => {
      if (current === entry) current = null;
      // Sempre limpa o que ainda é desta transição (nomes herdados por outra não são tocados).
      cleanup();
    });
}
