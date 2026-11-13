import { useState } from "react";
import type { Project } from "../projects/types";
import { Btn } from "../chrome/Btn";
import { Reveal } from "../chrome/useReveal";
import { Frame } from "./Frame";
import { Metrics, Stack } from "./ProjectParts";
import { ScreenHost } from "./ScreenHost";
import { ScreenTabs, tabId } from "./ScreenTabs";
import { useScreenSwitch } from "./useScreenSwitch";

interface Props {
  project: Project;
  /** posição dentro de um par "stack" (escalonamento do reveal). */
  stackIndex: number;
  onOpen: (projectId: string, screenId: string, opener: HTMLElement) => void;
}

export function ProjectCard({ project, stackIndex, onOpen }: Props) {
  const [screenId, setScreenId] = useState(project.screens[0].id);
  const screen = project.screens.find((s) => s.id === screenId) ?? project.screens[0];
  const { viewRef, select } = useScreenSwitch(screen.id, setScreenId);
  const viewId = `view-${project.id}`;

  return (
    <Reveal
      as="article"
      className={project.layout === "stack" ? "project project--stack spotlight" : "project spotlight"}
      index={stackIndex}
      data-project={project.id}
      data-screen={screen.id}
    >
      <div className="project__copy">
        <p className="project__kicker t-label text-accent">{project.kicker}</p>
        <h3 className="project__title t-h3">{project.title}</h3>
        <p className="project__lead">{project.lead}</p>
        {project.story ? (
          <dl className="project-story">
            <div>
              <dt className="t-label text-faint">Antes</dt>
              <dd>{project.story.before}</dd>
            </div>
            <div>
              <dt className="t-label text-faint">Depois</dt>
              <dd>{project.story.after}</dd>
            </div>
            <div className="project-story__result">
              <dt className="t-label text-accent">Resultado</dt>
              <dd>{project.story.result}</dd>
            </div>
          </dl>
        ) : null}
        <Stack items={project.stack} />
        <Metrics items={project.metrics} />
        <div className="project__actions cluster">
          <Btn
            variant="white"
            icon="arrow"
            magnetic
            data-open-for={project.id}
            onClick={(el) => onOpen(project.id, screen.id, el)}
          >
            Ampliar e ver detalhes
          </Btn>
          {project.demoUrl ? (
            <Btn variant="ghost" icon="arrow" magnetic href={project.demoUrl} external>
              Abrir em tela cheia
            </Btn>
          ) : null}
          {project.repo ? (
            <Btn variant="ghost" icon="github" magnetic href={project.repo} external>
              Repositório
            </Btn>
          ) : null}
        </div>
      </div>
      <div className="project__stage">
        <ScreenTabs
          screens={project.screens}
          activeId={screen.id}
          onSelect={select}
          label={`Telas de ${project.title}`}
          idPrefix={project.id}
          panelId={viewId}
        />
        <Frame
          url={screen.url || `${project.id}.app/${screen.id}`}
          hint={screen.hint}
          viewId={viewId}
          labelledBy={tabId(project.id, screen.id)}
          viewRef={viewRef}
        >
          <ScreenHost project={project} screen={screen} inVisor={false} go={select} />
        </Frame>
      </div>
    </Reveal>
  );
}
