interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

/** Barra de filtros (.mock__filter-btn). O estado do filtro é da tela: `value` + `onChange`. */
export function FilterBar<T extends string>({ options, value, onChange, label = "Filtro:" }: Props<T>) {
  return (
    <div className="mock__ctrls" style={{ padding: "0.4em 0.7em", borderBottom: "1px solid rgb(255 255 255 / 0.06)" }}>
      <span className="k">{label}</span>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={o.value === value ? "mock__filter-btn is-active" : "mock__filter-btn"}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
