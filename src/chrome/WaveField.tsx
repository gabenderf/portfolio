import { useEffect, useRef } from "react";
import { createWaveEngine } from "./waveEngine";

/** Fundo de ondas em canvas. As zonas ativas são o hero (#topo) e o rodapé (#contato). */
export function WaveField() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const zones = ["topo", "contato"].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    try {
      return createWaveEngine(canvas, root, zones);
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <div id="wave-root" ref={rootRef} aria-hidden="true">
      <canvas id="wave-canvas" ref={canvasRef} />
    </div>
  );
}
