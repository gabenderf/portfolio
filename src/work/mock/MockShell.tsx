import type { KeyboardEvent, ReactNode } from "react";

export interface MockNavItem {
  label: string;
  /** id de tela para onde `onNav` leva (se omitido, o item é só visual). */
  to?: string;
  active?: boolean;
}

interface Props {
  /** id do projeto: vira a classe de escopo `mock--<project>`. */
  project: string;
  brand: ReactNode;
  nav: MockNavItem[];
  /** Chamado ao clicar num item com `to` (normalmente o `go` das props da tela). */
  onNav?: (to: string) => void;
  /** Título à esquerda da barra superior. */
  title: ReactNode;
  /** Conteúdo à direita da barra superior (dentro de .mock__ctrls). */
  controls?: ReactNode;
  children: ReactNode;
}

/** Casca padrão de uma tela: sidebar (.mock__side) + coluna principal com barra superior (.mock__top). */
export function MockShell({ project, brand, nav, onNav, title, controls, children }: Props) {
  return (
    <div className={`mock mock--${project}`}>
      <aside className="mock__side">
        <div className="mock__brand">{brand}</div>
        {nav.map((n) => {
          const cls = n.active ? "mock__nav on" : "mock__nav";
          const to = n.to;
          if (!to || !onNav) return <div key={n.label} className={cls}>{n.label}</div>;
          const key = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNav(to);
            }
          };
          return (
            <div key={n.label} className={cls} role="button" tabIndex={0} onClick={() => onNav(to)} onKeyDown={key}>
              {n.label}
            </div>
          );
        })}
      </aside>
      <div className="mock__main">
        <div className="mock__top">
          <span>{title}</span>
          {controls ? <div className="mock__ctrls">{controls}</div> : null}
        </div>
        {children}
      </div>
    </div>
  );
}
