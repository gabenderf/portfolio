import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { site } from "../content/site";
import { projects as registered } from "../projects";
import { Reveal } from "../chrome/useReveal";
import { ProjectCard } from "./ProjectCard";
import { Visor } from "./Visor";
import { groupProjects, isDeepLink, normalizeProjects, parseHash, type VisorTarget } from "./projects";
import { withViewTransition } from "./viewTransition";

export function WorkSection() {
  const { work } = site;
  const list = useMemo(() => normalizeProjects(registered), []);
  const groups = useMemo(() => groupProjects(list), [list]);

  // Deep link inicial: #<projeto>/<tela> abre o visor já nessa tela.
  const [visor, setVisor] = useState<VisorTarget | null>(() => parseHash(list));
  const opener = useRef<HTMLElement | null>(null);
  const lastProject = useRef<string | null>(null);
  if (visor) lastProject.current = visor.projectId;
  const project = visor ? (list.find((p) => p.id === visor.projectId) ?? null) : null;

  // Hash acompanha o visor (replaceState: não polui o histórico).
  useEffect(() => {
    if (visor) window.history.replaceState(null, "", `#${visor.projectId}/${visor.screenId}`);
  }, [visor]);

  // Navegação manual pelo hash (digitar, voltar/avançar).
  useEffect(() => {
    const onHash = () => {
      const t = parseHash(list);
      if (t) setVisor((prev) => (prev && prev.projectId === t.projectId && prev.screenId === t.screenId ? prev : t));
      else setVisor(null);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [list]);

  const openVisor = useCallback(
    (projectId: string, screenId: string, el: HTMLElement) => {
      opener.current = el;
      lastProject.current = projectId;
      const target = { projectId, screenId };
      const src = el.closest("article")?.querySelector<HTMLElement>(".frame");
      withViewTransition(() => setVisor(target), {
        before: [[src, "shot"]],
        clearBeforeUpdate: [src],
        after: () => [[document.getElementById("visor-frame"), "shot"]],
      });
    },
    [],
  );

  const onScreenChange = useCallback((screenId: string) => {
    setVisor((v) => (v ? { ...v, screenId } : v));
  }, []);

  const onClosed = useCallback(() => {
    setVisor(null);
    if (isDeepLink()) window.history.replaceState(null, "", window.location.pathname + window.location.search);
    // foco volta ao botão "Inspecionar tela" que abriu (ou ao do projeto, em deep link)
    const el = opener.current ?? document.querySelector<HTMLElement>(`[data-open-for="${lastProject.current}"]`);
    opener.current = null;
    if (el && el.isConnected) el.focus();
  }, []);

  return (
    <>
      <section className="band work" id="trabalho">
        <div className="page-pad">
          <div className="container">
            <header className="band-head">
              <Reveal>
                <span className="tag tag--gray">{work.tag}</span>
                <h2 className="t-h2" style={{ marginTop: "0.8rem" }}>
                  {work.title}
                </h2>
              </Reveal>
              <Reveal as="p" className="text-muted" index={1}>
                {work.lead}
              </Reveal>
            </header>

            <div className="work-list" id="work-list">
              {groups.map((g) =>
                g.length === 2 ? (
                  <div className="project-pair" key={g[0].id}>
                    <ProjectCard project={g[0]} stackIndex={0} onOpen={openVisor} />
                    <ProjectCard project={g[1]} stackIndex={1} onOpen={openVisor} />
                  </div>
                ) : (
                  <ProjectCard key={g[0].id} project={g[0]} stackIndex={0} onOpen={openVisor} />
                ),
              )}
            </div>
          </div>
        </div>
      </section>
      <Visor project={project} screenId={visor?.screenId ?? ""} onScreenChange={onScreenChange} onClosed={onClosed} />
    </>
  );
}
