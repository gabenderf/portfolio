import { useLayoutEffect, useRef, useState } from "react";

/** Raiz do build demo do Hope SaaS (gerado por `npm run build:hope-demo` em public/demo/hope). */
export const HOPE_DEMO_BASE = `${import.meta.env.BASE_URL}demo/hope/`;

/** Sessão demo do Hope SaaS: mesma chave que src/auth/demo.ts lê no app. Iframe de mesma origem compartilha o sessionStorage da aba. */
const SESSION_KEY = "hope.demo.sessao";

export function seedHopeSession(role: "lideranca" | "admin" | "leitura" | "tv" = "lideranca") {
  try {
    if (!sessionStorage.getItem(SESSION_KEY)) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ role }));
  } catch {
    /* sem storage: o app abre na tela de escolha de perfil, que também funciona */
  }
}

interface Props {
  /** caminho dentro do demo do Hope SaaS, sem barra inicial (ex.: "expedicao/previsao"). */
  path?: string;
  /** URL completa de outra página de demonstração (ex.: as extensões em public/demo/ext). Tem prioridade sobre `path`. */
  src?: string;
  title: string;
  /** largura "de desktop" em que o app é desenhado antes de ser reduzido para caber. */
  desktopWidth?: number;
}

/**
 * O app real rodando num iframe. Em telas largas ele é desenhado a `desktopWidth` px e
 * reduzido por transform para caber na moldura; em telas estreitas usa o layout mobile do próprio app.
 */
export function LiveDemo({ path = "", src, title, desktopWidth = 1200 }: Props) {
  const url = src ?? `${HOPE_DEMO_BASE}${path}`;
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);
  const loaded = loadedPath === url;

  useLayoutEffect(() => {
    if (!src) seedHopeSession();
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [src]);

    // O Hope SaaS tem layout mobile próprio; as páginas das extensões são sempre desenhadas em desktopWidth.
  const virtualW = size ? (size.w < 640 && !src ? 390 : Math.max(size.w, desktopWidth)) : desktopWidth;
  const scale = size ? size.w / virtualW : 1;
  const virtualH = size ? size.h / scale : 800;

  return (
    <div className="live-demo" ref={box} data-loaded={loaded || undefined}>
      {size ? (
        <iframe
          key={url}
          src={url}
          title={title}
          loading="lazy"
          onLoad={() => setLoadedPath(url)}
          style={{ width: virtualW, height: virtualH, transform: `scale(${scale})` }}
        />
      ) : null}
      {!loaded ? <div className="live-demo__loading">Carregando o sistema…</div> : null}
    </div>
  );
}
