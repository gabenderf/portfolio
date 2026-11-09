import { Component, Suspense, type ErrorInfo, type ReactNode } from "react";
import type { Project, Screen } from "../projects/types";
import { useToast } from "../chrome/Toast";
import { useReducedMotion } from "../lib/useReducedMotion";

class ScreenErrorBoundary extends Component<{ where: string; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error(`[Portfolio] Erro ao renderizar ${this.props.where}`, error, info.componentStack);
  }
  render() {
    if (this.state.failed) return <div className="mock-error">Não foi possível carregar esta tela</div>;
    return this.props.children;
  }
}

interface Props {
  project: Project;
  screen: Screen;
  inVisor: boolean;
  go: (screenId: string) => void;
}

/** Renderiza uma tela dentro de error boundary + Suspense. A key por tela reinicia estado ao trocar de aba. */
export function ScreenHost({ project, screen, inVisor, go }: Props) {
  const toast = useToast();
  const reduceMotion = useReducedMotion();
  const { Component: Tela } = screen;
  return (
    <ScreenErrorBoundary key={`${project.id}/${screen.id}`} where={`${project.id}/${screen.id}`}>
      <Suspense fallback={<div className="mock-error">Carregando</div>}>
        <div className="screen-root">
          <Tela inVisor={inVisor} reduceMotion={reduceMotion} toast={toast} go={go} />
        </div>
      </Suspense>
    </ScreenErrorBoundary>
  );
}
