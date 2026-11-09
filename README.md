# Gabriel · Portfólio

Site pessoal publicado em **[gabeand.ia.br](https://gabeand.ia.br)**.

Mostra os sistemas que construí para a expedição de um e-commerce (Plataforma Hope), com as **telas reais** rodando no navegador em modo demonstração:

- **Hope SaaS**: o painel da liderança. É o próprio app, compilado em modo demo (dados gerados no navegador, login sem senha, sem banco), em `public/demo/hope`.
- **Extensão das bancadas** e **Coletor da fila**: o HTML e o CSS reais das extensões de Chrome, com um script de demonstração no lugar do service worker, em `public/demo/ext`.
- **Motor de previsão**: um simulador interativo do motor (ele não tem tela própria no sistema real).

Nenhum dado real da operação aparece e nada aqui fala com um backend.

## Rodar

```bash
npm install
npm run dev       # desenvolvimento
npm run check     # typecheck + build
npm run preview   # serve o build de dist/
```

## Atualizar o demo do Hope SaaS

O demo é gerado a partir do repositório do hope-saas (esperado em `../plataforma-hope/hope-saas`, ou no caminho de `HOPE_SAAS_DIR`):

```bash
npm run build:hope-demo
```

O script força o modo demo, zera as variáveis do Supabase, não gera sourcemaps e aborta se encontrar URL de projeto ou JWT no bundle. O resultado em `public/demo/hope` é versionado, porque a Vercel não tem acesso ao repositório do hope-saas.

## Publicação

Vercel, a partir da branch `main`. O `vercel.json` faz o fallback de SPA do demo (`/demo/hope/*`) e o cache dos assets.

## Stack

Vite, React 19 e TypeScript (strict). CSS próprio, com os tokens do design system em `design-system1/`. Sem biblioteca de UI.

## Estrutura

| Pasta | O que é |
|---|---|
| `src/chrome/` | Seções da página: nav, hero, sobre, plataforma, como trabalho, princípios e contato |
| `src/content/site.ts` | Todo o texto das seções |
| `src/work/` | Cards, abas, moldura, visor e `LiveDemo` (iframe que encaixa as telas reais na moldura) |
| `src/projects/<id>/` | Um projeto por pasta: textos, telas e, quando há, a simulação |
| `public/demo/` | Builds e páginas de demonstração dos sistemas reais |
| `scripts/` | Geração do demo do Hope SaaS |
| `design-system1/` | Design system de referência (especificação e tokens) |

## Como foi feito

Com agentes de IA orquestrados: um modelo orquestrador escreveu o contrato entre módulos, agentes construíram cada parte em paralelo, um revisor de outro fornecedor revisou cada entrega e uma revisão final fechou o projeto. A seção "Como trabalho" do site conta os detalhes.
