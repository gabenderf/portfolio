import type { ReactNode } from "react";
import { MockShell } from "../../work/mock";

export type TelaId = "simulador" | "falhas" | "paridade" | "calibracao";

const NAV: { id: TelaId; label: string }[] = [
  { id: "simulador", label: "Simulador" },
  { id: "falhas", label: "Plausível e errado" },
  { id: "paridade", label: "Uma função" },
  { id: "calibracao", label: "Calibração" },
];

interface Props {
  ativa: TelaId;
  go: (id: string) => void;
  title: ReactNode;
  controls?: ReactNode;
  children: ReactNode;
}

/** Casca comum das quatro telas: navegação entre elas e corpo rolável. */
export function PvShell({ ativa, go, title, controls, children }: Props) {
  return (
    <MockShell
      project="previsao"
      brand="Hope · Previsão"
      onNav={go}
      nav={NAV.map((n) => ({ label: n.label, to: n.id, active: n.id === ativa }))}
      title={title}
      controls={controls}
    >
      <div className="pv-body">{children}</div>
    </MockShell>
  );
}

interface CampoProps {
  label: string;
  valor: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

/** Slider com rótulo e valor. Sem id: o rótulo envolve o input. */
export function Campo({ label, valor, min, max, step, value, onChange }: CampoProps) {
  return (
    <label className="pv-campo">
      <span className="pv-campo__top">
        <span>{label}</span>
        <b>{valor}</b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
