import { useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../projects/types";
import { Btn } from "../chrome/Btn";
import { Frame } from "./Frame";
import { Metrics, Stack } from "./ProjectParts";
import { ScreenHost } from "./ScreenHost";
import { ScreenTabs, tabId } from "./ScreenTabs";
import { useScreenSwitch } from "./useScreenSwitch";

interface Props {
  project: Project | null;
  screenId: string;
  onScreenChange: (screenId: string) => void;
  /** Chamado quando o <dialog> fecha (botão, Esc, backdrop, ou programaticamente). */
  onClosed: () => void;
}

/** Visor modal (<dialog>). O conteúdo só existe enquanto há um projeto aberto: as telas desmontam ao fechar. */
export function Visor({ project, screenId, onScreenChange, onClosed }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = project !== null;

  useLayoutEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open) {
      if (!d.open) d.showModal();
      closeRef.current?.focus();
    } else if (d.open) {
      d.close();
    }
  }, [open, project?.id]);

  return createPortal(
    <dialog
      className="visor"
      id="visor"
      ref={dialogRef}
      aria-labelledby="visor-title"
      onClose={onClosed}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close();
      }}
    >
      {project ? (
        <VisorBody
          key={project.id}
          project={project}
          screenId={screenId}
          onScreenChange={onScreenChange}
          closeRef={closeRef}
          onClose={() => dialogRef.current?.close()}
        />
      ) : null}
    </dialog>,
    document.body,
  );
}

interface BodyProps {
  project: Project;
  screenId: string;
  onScreenChange: (screenId: string) => void;
  closeRef: React.Ref<HTMLButtonElement>;
  onClose: () => void;
}

function VisorBody({ project, screenId, onScreenChange, closeRef, onClose }: BodyProps) {
  const screen = project.screens.find((s) => s.id === screenId) ?? project.screens[0];
  const { viewRef, select } = useScreenSwitch(screen.id, onScreenChange);

  return (
    <div className="visor__panel spotlight" data-project={project.id} data-screen={screen.id}>
      <header className="visor__head">
        <div>
          <p className="t-label text-accent">{project.kicker}</p>
          <h2 className="t-h3" id="visor-title" style={{ marginTop: "0.35rem" }}>
            {project.title}
          </h2>
          <p className="text-muted" style={{ marginTop: "0.5rem" }}>
            {project.lead}
          </p>
        </div>
        <div className="cluster" style={{ gap: "0.5rem", alignItems: "flex-start" }}>
          {project.demoUrl ? (
            <Btn variant="white" small icon="arrow" iconSize={18} href={project.demoUrl} external>
              Abrir em tela cheia
            </Btn>
          ) : null}
          {project.repo ? (
            <Btn variant="ghost" small icon="github" iconSize={18} href={project.repo} external>
              Repositório
            </Btn>
          ) : null}
          <button className="btn btn--ghost btn--sm" type="button" ref={closeRef} onClick={onClose}>
            <span className="btn__label">Fechar</span>
          </button>
        </div>
      </header>
      <ScreenTabs
        screens={project.screens}
        activeId={screen.id}
        onSelect={select}
        label="Telas no visor"
        idPrefix="visor"
        panelId="visor-view"
      />
      <div className="visor__grid">
        <Frame
          url={screen.url || `${project.id}.app/${screen.id}`}
          hint={screen.hint}
          viewId="visor-view"
          labelledBy={tabId("visor", screen.id)}
          viewRef={viewRef}
          frameId="visor-frame"
        >
          <ScreenHost project={project} screen={screen} inVisor go={select} />
        </Frame>
        <aside className="visor__meta">
          <div>{project.stack.length ? <Stack items={project.stack} /> : null}</div>
          <div>
            <Metrics items={project.metrics} />
          </div>
          <div>
            {project.context.length ? (
              <>
                <h3>Contexto</h3>
                {project.context.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </>
            ) : null}
          </div>
          <div>
            {project.concepts.length ? (
              <>
                <h3>Conceitos</h3>
                <dl>
                  {project.concepts.map((c) => (
                    <div key={c.title}>
                      <dt>{c.title}</dt>
                      <dd>{c.text}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : null}
          </div>
          <div>
            {project.arch.length ? (
              <>
                <h3>Arquitetura</h3>
                <ol>
                  {project.arch.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
