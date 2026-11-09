import type { ReactNode, Ref } from "react";

export const DEFAULT_HINT = "UI Interativa · Clique nas linhas";

interface Props {
  url: string;
  hint?: string;
  viewId: string;
  labelledBy: string;
  frameRef?: Ref<HTMLDivElement>;
  viewRef?: Ref<HTMLDivElement>;
  frameId?: string;
  children: ReactNode;
}

/** Moldura "navegador" que contém a tela. */
export function Frame({ url, hint, viewId, labelledBy, frameRef, viewRef, frameId, children }: Props) {
  return (
    <div className="frame" ref={frameRef} id={frameId}>
      <div className="frame__bar">
        <div className="frame__dots" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </div>
        <div className="frame__url">{url}</div>
        <div className="frame__badge">
          <span className="badge-dot"></span> <span>{hint || DEFAULT_HINT}</span>
        </div>
      </div>
      <div className="frame__view" id={viewId} role="tabpanel" aria-labelledby={labelledBy} ref={viewRef}>
        {children}
      </div>
    </div>
  );
}
