import type { KeyboardEvent } from "react";

/**
 * Teclado de um tablist com roving tabindex: setas esquerda/direita (circular), Home, End.
 * Use no container [role=tablist]; as abas [role=tab] precisam de tabIndex 0 (selecionada) ou -1.
 * `onSelect(index)` é chamado depois de focar a nova aba.
 */
export function useRovingTabs(onSelect: (index: number) => void) {
  return (e: KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLElement;
    const tab = target.closest<HTMLElement>('[role="tab"]');
    if (!tab || !e.currentTarget.contains(tab)) return;
    const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
    const i = tabs.indexOf(tab);
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i + tabs.length - 1) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    e.preventDefault();
    tabs[next].focus();
    onSelect(next);
  };
}
