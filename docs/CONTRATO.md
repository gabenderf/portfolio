# Contrato de projetos do portfólio (React)

Site em **Vite + React 19 + TypeScript** (strict). Cada projeto vive **só na própria pasta**
`src/projects/<id>/`. Agentes diferentes podem trabalhar em pastas diferentes ao mesmo tempo:
a única edição em arquivo compartilhado é uma linha em `src/projects/index.ts`.

```
src/projects/<id>/
  index.ts        # export default Project (metadados + lista de telas); importa ./styles.css
  <Tela>.tsx      # uma tela por arquivo (componente React que recebe ScreenProps)
  data.ts         # dados mock (opcional, recomendado)
  styles.css      # CSS exclusivo, escopo .mock--<id>
```

Pasta de referência: `src/projects/_exemplo/` (2 telas: master-detail com filtro + ação simulada). Ela compila
sempre, mas fica fora do array exportado; para vê-la no site, descomente o import e a entrada em `src/projects/index.ts`
(deep link: `#_exemplo/lista`).

## Tipos (src/projects/types.ts)

```ts
export interface ScreenProps {
  inVisor: boolean;                 // a tela pode estar no card e no visor ao mesmo tempo
  reduceMotion: boolean;
  toast: (msg: string) => void;
  go: (screenId: string) => void;   // troca de aba no mesmo escopo (card ou visor)
}
export interface Screen {
  id: string; label: string; url: string; hint?: string;
  Component: React.ComponentType<ScreenProps>;
}
export interface Project {
  id: string; order: number; layout: "feature" | "stack";
  kicker: string; title: string; lead: string;
  context: string[]; concepts: { title: string; text: string }[];
  stack: string[]; metrics: { label: string; value: string; sub?: string }[];   // 0 a 3
  arch: string[]; repo: string | null;
  screens: Screen[];
}
```

- `id`: slug `[a-z0-9_-]` (primeiro caractere `[a-z0-9_]`); vira `data-project` e o deep link `#<id>/<tela>`.
- `order`: ordem na página (menor primeiro). `feature` = card largo; dois `stack` **consecutivos na ordem** ficam lado a lado.
- `metrics`: até 3 (o resto é descartado). `repo: null` = sem botão "Repositório", no card e no visor.
- `Screen.url`: texto da barra do frame. `Screen.hint`: texto do selo (padrão "UI Interativa · Clique nas linhas").
- `Component` pode ser um componente normal ou `React.lazy(...)` (há `Suspense` em volta).

## Como adicionar um projeto

1. Copie `src/projects/_exemplo/` para `src/projects/<id>/` e ajuste `index.ts`.
2. Em `src/projects/index.ts`: uma linha de `import` e uma entrada no array.
3. CSS só em `src/projects/<id>/styles.css` (importado pelo `index.ts` do projeto).

## Regras para as telas

- **Estado por instância.** A mesma tela pode estar renderizada no card e no visor ao mesmo tempo, cada uma com seu
  estado (`useState` dentro do componente). Nada de `id` global no DOM, nada de estado em variável de módulo.
- Eventos com handlers React (`onClick`...). Nada de `document.addEventListener` sem cleanup em `useEffect`.
- Timers e listeners: sempre com cleanup no `useEffect`. Para ações simuladas use `useSimulate`/`ActionButton`
  (o timer é cancelado no unmount).
- **Cada tela roda dentro de uma error boundary.** Um erro mostra "Não foi possível carregar esta tela" e não derruba a página
  (o erro vai para o `console.error`).
- Trocar de aba remonta a tela (o estado da tela anterior se perde). Estado que deva sobreviver à troca fica fora da tela.
- Respeite `reduceMotion` em animações próprias.
- Deep link: `#<projeto>/<tela>` abre o visor naquela tela; trocar de tela no visor atualiza o hash (`replaceState`);
  fechar limpa o hash.

## Filtro: é estado da tela

O antigo filtro genérico por delegação (`data-filter`) **não existe mais**. Em React o filtro é estado da tela;
use `FilterBar` e filtre a lista antes de renderizar:

```tsx
import { useState } from "react";
import type { ScreenProps } from "../types";
import { ActionButton, FilterBar, MockShell, Pill, fmt } from "../../work/mock";

type Filtro = "all" | "ok" | "wait";
const ITENS = [
  { id: "1", nome: "Pedido 1042", status: "ok" as const, valor: 1280.5, nota: "Liberado." },
  { id: "2", nome: "Pedido 1043", status: "wait" as const, valor: 342, nota: "Em análise." },
];

export function PedidosScreen({ toast }: ScreenProps) {
  const [filtro, setFiltro] = useState<Filtro>("all");
  const [sel, setSel] = useState(ITENS[0].id);
  const visiveis = ITENS.filter((i) => filtro === "all" || i.status === filtro);
  const atual = ITENS.find((i) => i.id === sel) ?? ITENS[0];

  return (
    <MockShell
      project="meu-projeto"
      brand="Meu produto"
      nav={[{ label: "Pedidos", active: true }, { label: "Painel" }]}
      title="Pedidos de hoje"
      controls={
        <>
          <ActionButton onDone={() => toast("Auditoria concluída")}>Auditar</ActionButton>
          <Pill>{ITENS.length} itens</Pill>
        </>
      }
    >
      <div className="mock__split">
        <div className="mock__pane" style={{ padding: 0 }}>
          <FilterBar
            options={[{ value: "all", label: "Todos" }, { value: "ok", label: "Liberado" }, { value: "wait", label: "Em análise" }]}
            value={filtro}
            onChange={setFiltro}
          />
          <table>
            <thead><tr><th>Pedido</th><th>Estado</th><th>Valor</th></tr></thead>
            <tbody>
              {visiveis.map((i) => (
                <tr key={i.id} className={i.id === atual.id ? "is-clickable is-active" : "is-clickable"} onClick={() => setSel(i.id)}>
                  <td><strong>{i.nome}</strong></td><td className={i.status}>{i.status}</td><td>R$ {fmt.dec(i.valor, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mock__pane">
          <p className="k">Detalhe · {atual.nome}</p>
          <div className="mock__note">{atual.nota}</div>
        </div>
      </div>
    </MockShell>
  );
}
```

## Componentes compartilhados (src/work/mock/, importe de `../../work/mock`)

| Componente | Uso |
|---|---|
| `MockShell` | Casca da tela: `.mock.mock--<project>` com sidebar (`brand`, `nav`) e coluna principal com barra superior (`title`, `controls`). Props: `project`, `brand`, `nav: {label, to?, active?}[]`, `onNav?(to)` (passe o `go`), `title`, `controls?`, `children`. Itens com `to` + `onNav` viram navegação entre telas. |
| `FilterBar` | Botões de filtro (`.mock__filter-btn`): `options: {value,label}[]`, `value`, `onChange`, `label?`. Genérico no tipo do valor. |
| `ActionButton` | Botão `.mock__action` que simula processamento ("Processando...", ignora cliques enquanto carrega). Props: `children: string`, `onDone?`, `ms?` (600), `icon?`, `style?`. |
| `Pill` | `.pill`; `tone="ok" \| "wait" \| "bad"` opcional. |
| `Bar` | Barra de progresso: `value` 0..100, `color?`. |
| `Hotspot` | Texto clicável (`.mock__hotspot`) que mostra o toast "Âncora inspecionada: ..." (`anchor?`, texto como padrão). |
| `fmt`, `useSimulate`, `Icon` | Reexportados por conveniência. |

Dentro da tela, o resto é HTML com as classes de `src/styles/site.css`: `.mock__pane`, `.mock__split`, `.mock__note`,
`.k`, `.ok`/`.wait`/`.bad`, `table/th/td`, `tr.is-clickable`/`tr.is-active`, `cite`, `.trace`/`.trace__row`
(`--w` largura, `--x` deslocamento), `.checks`, etc. O tamanho de fonte do `.mock` escala com o frame (`cqi`): use `em`.

## Utilitários

- `fmt` (`src/lib/fmt.ts`): `int(n)` → `1.234`; `dec(n, casas = 1)` → `1.234,5`; `pct(n, casas = 1)` (n em pontos percentuais: `98.4` → `98,4%`);
  `hora(x)` (`Date` → `HH:MM`; número = minutos desde 00:00, módulo 24 h).
- `useSimulate()` (`src/lib/useSimulate.ts`): `{ loading, label(original), run(fn?, ms = 600) }`. `run` ignora chamadas enquanto carrega;
  o timer é cancelado no unmount.
- `useReducedMotion()` (`src/lib/useReducedMotion.ts`), `useToast()` (`src/chrome/Toast.tsx`; as telas já recebem `toast` por props).

## CSS

- `src/styles/site.css`: chrome do site e classes de mock. Não edite para um projeto específico.
- `src/styles/design-tokens.css`: tokens do design system (não alterar). `var(--c-accent)`, `--color-success`, `--font-mono`, etc.
- `src/projects/<id>/styles.css`: **todas** as regras com escopo `.mock--<id>` (classe aplicada por `MockShell`) ou `[data-project="<id>"]`.
- Ícones: `<Icon name="sparkles" />` (`arrow`, `github`, `linkedin`, `x`, `mail`, `sparkles`).

## Fora dos projetos

- Textos das seções (hero, trabalho, arquitetura, princípios, contato, rodapé): `src/content/site.ts` (dados tipados, sem mexer em componentes).
- Chrome (nav, hero, ondas, arquitetura, contato, toast, hooks de reveal/spotlight/magnetic): `src/chrome/`.
- Seção de trabalho (cards, abas, frame, visor, deep link): `src/work/`.

## Comandos

`npm run dev` · `npm run typecheck` · `npm run build` · `npm run preview` · `npm run check` (= typecheck + build).
