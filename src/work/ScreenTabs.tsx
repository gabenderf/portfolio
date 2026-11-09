import type { Screen } from "../projects/types";
import { useRovingTabs } from "../chrome/useRovingTabs";

interface Props {
  screens: Screen[];
  activeId: string;
  onSelect: (screenId: string) => void;
  label: string;
  /** Prefixo dos ids das abas (tab-<prefix>-<tela>); o painel é #<panelId>. */
  idPrefix: string;
  panelId: string;
}

export const tabId = (prefix: string, screenId: string) => `tab-${prefix}-${screenId}`;

/** Abas de telas com roving tabindex e setas/Home/End. */
export function ScreenTabs({ screens, activeId, onSelect, label, idPrefix, panelId }: Props) {
  const onKeyDown = useRovingTabs((i) => onSelect(screens[i].id));
  return (
    <div className="screen-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {screens.map((s) => {
        const on = s.id === activeId;
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            id={tabId(idPrefix, s.id)}
            aria-selected={on}
            aria-controls={panelId}
            tabIndex={on ? 0 : -1}
            data-screen={s.id}
            onClick={(e) => {
              onSelect(s.id);
              e.currentTarget.focus();
            }}
          >
            {s.label || s.id}
          </button>
        );
      })}
    </div>
  );
}
