import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icons";
import { useMagnetic } from "./useMagnetic";

interface BtnProps {
  variant: "white" | "ghost";
  small?: boolean;
  icon?: IconName;
  iconSize?: number;
  magnetic?: boolean;
  href?: string;
  external?: boolean;
  /** Recebe o elemento clicado (útil para devolver o foco depois). */
  onClick?: (el: HTMLElement) => void;
  className?: string;
  "data-open-for"?: string;
  children: ReactNode;
}

/** Botão/link do design system (.btn). Renderiza <a> quando há href, senão <button>. */
export function Btn({ variant, small, icon, iconSize = 20, magnetic, href, external, onClick, className, children, ...rest }: BtnProps) {
  const mag = useMagnetic();
  const cls = ["btn", `btn--${variant}`, small ? "btn--sm" : "", className ?? ""].filter(Boolean).join(" ");
  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {icon ? (
        <span className="btn__icon">
          <Icon name={icon} size={iconSize} />
        </span>
      ) : null}
    </>
  );
  if (href !== undefined) {
    return (
      <a
        ref={magnetic ? mag : undefined}
        className={cls}
        href={href}
        data-magnetic={magnetic ? "" : undefined}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...rest}
      >
        {inner}
      </a>
    );
  }
  return (
    <button
      ref={magnetic ? mag : undefined}
      className={cls}
      type="button"
      onClick={(e) => onClick?.(e.currentTarget)}
      data-magnetic={magnetic ? "" : undefined}
      {...rest}
    >
      {inner}
    </button>
  );
}
