import type { Project } from "../projects/types";

const SLUG = /^[a-z0-9_][a-z0-9_-]*$/;

/** Valida, deduplica por id (o último vence), limita métricas a 3 e ordena por `order` (estável). */
export function normalizeProjects(list: Project[]): Project[] {
  const byId = new Map<string, Project>();
  for (const p of list) {
    if (!p || typeof p.id !== "string" || !SLUG.test(p.id)) {
      console.error("[Portfolio] projeto com id inválido (use slug minúsculo [a-z0-9_-])", p?.id);
      continue;
    }
    if (!Array.isArray(p.screens) || p.screens.length === 0 || !p.screens.every((s) => s && typeof s.id === "string" && s.Component)) {
      console.error(`[Portfolio] projeto '${p.id}' precisa de screens[] com { id, Component }`);
      continue;
    }
    byId.set(p.id, { ...p, layout: p.layout === "stack" ? "stack" : "feature", metrics: p.metrics.slice(0, 3) });
  }
  return [...byId.values()]
    .map((p, i) => ({ p, i }))
    .sort((a, b) => a.p.order - b.p.order || a.i - b.i)
    .map((x) => x.p);
}

/** Dois "stack" consecutivos viram um par lado a lado; o resto fica em largura total. */
export function groupProjects(sorted: Project[]): Project[][] {
  const groups: Project[][] = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i];
    const next = sorted[i + 1];
    if (p.layout === "stack" && next && next.layout === "stack") {
      groups.push([p, next]);
      i++;
    } else {
      groups.push([p]);
    }
  }
  return groups;
}

/* Deep link: #<projeto>/<tela> */
export interface VisorTarget {
  projectId: string;
  screenId: string;
}

export function parseHash(projects: Project[], hash: string = window.location.hash): VisorTarget | null {
  const raw = hash.replace(/^#/, "");
  const slash = raw.indexOf("/");
  if (slash <= 0) return null;
  let pid: string;
  let sid: string;
  try {
    pid = decodeURIComponent(raw.slice(0, slash));
    sid = decodeURIComponent(raw.slice(slash + 1));
  } catch {
    return null;
  }
  const project = projects.find((p) => p.id === pid);
  if (!project) return null;
  const screen = project.screens.find((s) => s.id === sid) ?? project.screens[0];
  return { projectId: project.id, screenId: screen.id };
}

export const isDeepLink = (hash: string = window.location.hash) => /^#[^/]+\/./.test(hash);
