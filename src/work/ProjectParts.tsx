import type { Project } from "../projects/types";

export function Stack({ items }: { items: string[] }) {
  return (
    <div className="tech-stack">
      {items.map((t) => (
        <span key={t} className="tag tag--outline tag--sm">
          {t}
        </span>
      ))}
    </div>
  );
}

export function Metrics({ items }: { items: Project["metrics"] }) {
  if (!items.length) return null;
  return (
    <dl className="metrics">
      {items.map((m) => (
        <div key={m.label}>
          <dt>{m.label}</dt>
          <dd>{m.value}</dd>
          {m.sub ? <dd className="sub">{m.sub}</dd> : null}
        </div>
      ))}
    </dl>
  );
}
