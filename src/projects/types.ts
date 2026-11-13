import type { ComponentType } from "react";

/** Props que toda tela recebe. Ver docs/CONTRATO.md. */
export interface ScreenProps {
  /** A mesma tela pode estar no card e no visor ao mesmo tempo: estado é por instância, nada de id global no DOM. */
  inVisor: boolean;
  reduceMotion: boolean;
  toast: (msg: string) => void;
  /** Troca de aba no mesmo escopo (card ou visor). */
  go: (screenId: string) => void;
}

export interface Screen {
  id: string;
  /** Texto da aba. */
  label: string;
  /** Texto da barra do frame. */
  url: string;
  /** Texto do selo do frame (padrão: "UI Interativa · Clique nas linhas"). */
  hint?: string;
  Component: ComponentType<ScreenProps>;
}

export interface Project {
  /** slug único [a-z0-9_-] (sem começar com hífen); vira data-project e o primeiro segmento do deep link #<id>/<tela>. */
  id: string;
  order: number;
  /** "feature" = card largo; "stack" = meia largura (dois stack consecutivos ficam lado a lado). */
  layout: "feature" | "stack";
  kicker: string;
  title: string;
  lead: string;
  /** Antes, Depois e Resultado, em linguagem de negócio (aparece no card). */
  story?: { before: string; after: string; result: string };
  context: string[];
  concepts: { title: string; text: string }[];
  stack: string[];
  /** 0 a 3 métricas. */
  metrics: { label: string; value: string; sub?: string }[];
  arch: string[];
  /** URL do repositório ou null (null = sem botão, no card e no visor). */
  repo: string | null;
  /** Link para abrir o sistema real em tela cheia (opcional). */
  demoUrl?: string;
  screens: Screen[];
}
