# Frontier Portfolio — Design System v2.1 (Clean Glass & Soft Rounded)

Sistema visual moderno de engenharia de produto para SaaS e sistemas de IA. A linguagem foi inspirada em [isidor.ai](https://www.isidor.ai/) e evoluiu com as diretrizes executivas de [Linear](https://linear.app), [Figma](https://figma.com) e [x.ai](https://x.ai), combinando **superfícies de vidro translúcidas (Glassmorphism clean)**, **cantos suavemente arredondados**, **linhas de margem limpas (zero pontilhados)** e **seção hero de contato e redes em destaque**.

Arquivos:

| Arquivo | Função |
|---|---|
| `design-tokens.css` | Tokens, base, tipo, superfícies, componentes, motion e utilitários. Fonte única em CSS. |
| `tokens.json` | Os mesmos valores em Design Tokens (DTCG), prontos para Tailwind, Figma ou outra stack. |
| `index.html` | Protótipo interativo completo com motor de ondas fluído, telas interativas e grade bento de contato. |
| `_inspect/` | Código-fonte real do site de referência. Mantido para fins de rastreabilidade analítica. |

Como usar num projeto:

```html
<link rel="stylesheet" href="design-tokens.css">
```

As camadas `@layer tokens, base, type, surfaces, components, motion, utilities` fazem o CSS do produto vencer o sistema sem necessidade de `!important`.

---

## 1. Arquitetura Visual e Decisões de Design (v2.1)

### 1.1 Tipografia 100% Sem Serifa Geométrica e Moderna
Substituição completa de qualquer fonte serifada (`Instrument Serif`) por uma família Sans-Serif moderna, técnica e de alto impacto:

- **Display / Headings (`--font-display`, `--font-heading`)**: `"Poppins"`, combinada com `"Plus Jakarta Sans"` como par complementar.
- **Body / UI (`--font-sans`)**: `"Plus Jakarta Sans"`, `"Poppins"`, `"Geist"`, system-ui.
- **Labels Técnicos & Monospace (`--font-mono`)**: `"JetBrains Mono"`, `"Geist Mono"`, monospace.
- **Zero Itálico Editorial**: Removeu-se o `font-style: italic` herdado da antiga fonte serifada. O destaque de palavras-chave nos títulos agora utiliza **contraste de peso refinado** (`font-weight: 300` fino vs `500`/`600` semi-bold) ou sutis variações de cor (`--color-fg-subtle`), mantendo sobriedade executiva de ponta.

### 1.2 Fundo Cinza Escuro Carbono / Ardósia (Adeus `#010101`)
O preto absoluto `#010101` foi substituído por uma paleta grafite/carbono profunda e sofisticada (`#13151a`), eliminando o contraste duro e trazendo riqueza tonal:

| Token | Hex / RGBA | Papel |
|---|---|---|
| `--c-black` / `--n-0` | `#13151a` | Fundo principal da página (ardósia escuro carbono) |
| `--n-50` | `#161920` | Superfície sunken / base discreta |
| `--n-100` / elevated | `#1a1d24` | Fundo de painéis e cards de nível 1 |
| `--n-150` | `#20242d` | Barra de título e cards em repouso |
| `--n-200` | `#282d38` | Superfícies com elevação no hover |
| `--n-250` | `#323846` | Divisores e contornos sutis |
| `--c-accent` | `#0943a0` | Azul cobalto de marca / âncora de ação |
| `--c-accent-light` | `#2563eb` | Azul safira elétrico para destaques e hover |
| `--c-accent-bright` / signal | `#60a5fa` | Azul técnico para pulsos e telemetria |
| `--c-wave-hero` | `#93a8c7` | Linha do canvas hero: prata-azulado translúcido |
| `--c-wave-footer` | `#7f95b7` | Linha do canvas footer: azul safira suave |

### 1.3 Estética Clean Glass & Soft Rounded (Adeus Pontilhados e Cantos Pontudos)
A pedido de refinamento estético, eliminou-se o visual excessivamente industrial de "blueprint" em prol de uma experiência clean, sofisticada e tátil:

1. **Remoção dos Pontilhados de Margem**:
   - Eliminou-se `border-inline: var(--border-dashed)` da classe `.container`. As margens da página agora respiram de forma fluida e limpa sobre o campo de ondas interativo.
2. **Bordas Contínuas Ultra-Sutis de Vidro**:
   - Substituição de `1px dashed` por bordas sólidas ultra-sutis (`1px solid rgba(255, 255, 255, 0.08)` a `0.12`), acompanhadas de highlight especular interno superior (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.10..0.12)`).
3. **Escala de Raios Suavemente Arredondados**:
   - `--radius-xs: 6px`: tags e cantos compactos.
   - `--radius-sm: 10px`: botões (`.btn`), inputs, chips de filtro, abas de telas (`.screen-tabs`).
   - `--radius-md: 14px`: menu flutuante (`.site-nav`), botões da esteira de arquitetura (`.pipe button`).
   - `--radius-lg: 18px`: cards de projeto (`.project`), frames de SaaS (`.frame`), visor modal (`.visor__panel`), caixa de arquitetura e cards de redes sociais (`.contact-card`).
   - `--radius-xl: 24px`: modais expandidos e grandes containers.
4. **Menu Flutuante (`.site-nav`)**:
   - Formato suavemente arredondado (`border-radius: var(--radius-md)`), fundo de vidro translúcido (`rgba(22, 25, 32, 0.58)`), `backdrop-filter: blur(20px) saturate(180%)`, borda sutil contínua e links internos transparentes com iluminação suave no hover e seleção em pílula sutil.
5. **Efeito Spotlight Curvilíneo**:
   - A camada especular `.spotlight::after` possui `border-radius: inherit`, acompanhando organicamente a curvatura dos novos cards e superfícies de vidro.

### 1.4 Calibragem Sedosa e Fluida do Motor de Ondas
- **Regra Zero Violeta (`Anti-Slop`)**: Linhas de onda em acabamento prata-azulado gelo translúcido (`#93a8c7` / `rgba(168, 196, 230, 0.42)`) com traço de `1.35px`.
- **Física Orgânica**: Harmônicos senoidais suaves integrados a Perlin noise de baixa frequência (`tension: 0.006`, `friction: 0.93`), sem torções duras.

### 1.5 Diretrizes Taste-Skill e Micro-Interações
- **Elevação Tátil**: Cards e projetos interativos com elevação suave (`translate: 0 -3px`) e clareamento da borda de vidro no hover.
- **Feedback Tátil em Botões**: Transição com compressão precisa (`scale: 0.98` e `translateY(1px)`).
- **Diagrama SVG de Arquitetura com Pulsos Vivos (Regra 7)**:
  - Diagrama visual de nós: Entrada → Orquestrador LLM → 3 Lanes de Verificação → Gate de Consenso → Tela com Contrato.
  - Pulsos luminosos em azul safira percorrem as conexões SVG (`pipeline-flow`), com botão de pausa/reprodução.

---

## 2. Especificação dos Tokens (CSS & DTCG)

### 2.1 Cores e Superfícies
```css
:root {
  --c-black: #13151a;
  --c-white: #ffffff;
  --c-gray: #2d3340;
  --c-accent: #0943a0;
  --c-accent-light: #2563eb;
  --c-accent-bright: #60a5fa;
  --c-wave-hero: #93a8c7;
  --c-wave-footer: #7f95b7;
  --color-border: rgba(255, 255, 255, 0.10);
  --color-border-subtle: rgba(255, 255, 255, 0.08);
}
```

### 2.2 Raios e Bordas (Clean Glass & Soft Rounded)
```css
:root {
  --radius-xs: 6px;
  --radius-sm: 10px;           /* botões, links do menu, inputs, chips, abas */
  --radius-md: 14px;           /* navbar flutuante, cards internos, painéis */
  --radius-lg: 18px;           /* frames SaaS, cards de projeto, visor, social bento */
  --radius-xl: 24px;
  --radius-pill: 999px;

  --border-solid: 1px solid rgba(255, 255, 255, 0.08);
  --border-glass: 1px solid rgba(255, 255, 255, 0.10);
  --shadow-inset-hi: inset 0 1px 0 rgba(255, 255, 255, 0.10);
}
```

### 2.3 Tipografia
```css
:root {
  --font-display: "Poppins", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-heading: "Poppins", "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "Plus Jakarta Sans", "Poppins", "Geist", "Aspekta", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Geist Mono", "PP Supply Mono", ui-monospace, monospace;
}
```

---

## 4. Telas Interativas de Produto (Interactive SaaS Micro-Demos)

Inspirado nas diretrizes de engenharia de produto de empresas de vanguarda ([Linear](https://linear.app), [Stripe](https://stripe.com), [Raycast](https://raycast.com), [Cursor](https://cursor.com)), o portfólio não emprega imagens estáticas para ilustrar software. Todas as telas nos frames de janela (`.frame`) são renderizadas com HTML, CSS e interatividade viva.

### 4.1 Indicador de Interface Viva (`.frame__badge`)
Cada barra de janela (`.frame__bar`) exibe um badge discreto e elegante sinalizando que a tela é interativa:

```html
<div class="frame__bar">
  <div class="frame__dots" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="frame__url" data-url>hope.app/expedicao</div>
  <div class="frame__badge"><span class="badge-dot"></span> UI INTERATIVA · CLIQUE NAS LINHAS</div>
</div>
```

- **Ponto pulsante (`.badge-dot`)**: animado via `@keyframes pulse-ring` em azul safira brilhante (`--c-accent-bright`).
- **Tipografia**: JetBrains Mono, `0.58rem`, tracking largo (`0.07em`), caixa alta.

### 4.2 Os 4 Padrões de Micro-Interação Implementados
1. **Master-Detail / Row Inspection (`.is-clickable`, `.is-active`)**:
   - Linhas de tabelas dentro do `.mock` reagem ao hover com iluminação safira sutil e, ao serem clicadas, assumem `.is-active` com borda lateral esquerda e atualizam imediatamente o painel de detalhes correspondente.
2. **Interactive Filter & State Toggles (`.mock__filter-btn`, `.mock__chip`)**:
   - Controles contextuais compactos que filtram registros por status ("Todos", "Extraindo", "Aprovados", "Sem Âncora") ou alternam entre cláusulas de contratos.
3. **Simulated AI Action / Streaming Trigger (`.mock__action`, `data-mock-action`)**:
   - Botões com ícone vetorial (`#i-sparkles`) que simulam um processamento de 600ms (`.is-loading`), atualizam valores de confiança e status com feedback visual ao vivo e emitem toast no sistema.
4. **Waterfall Trace Inspection (`.trace__row.is-clickable`)**:
   - Barras de telemetria OpenTelemetry clicáveis que exibem payloads de nó, latência p95, modelo consumido e volume de tokens.

---

## 5. Vitrines GitHub (Showcase Repos) e Barra Social do Rodapé

### 5.1 Ações de Card de Projeto com Link para Repositório de Demonstração
Cada projeto do portfólio conta com uma dupla de ações:
- **Ação Primária**: `Abrir tela` / `Inspecionar tela` (botão `.btn--white` com `#i-arrow`, abrindo o visor modal com View Transitions).
- **Ação Secundária**: `Repo Demo` / `GitHub Showcase` (link `.btn--ghost` com o ícone oficial `#i-github`, apontando para a vitrine pública de arquitetura no GitHub).

```html
<div class="project__actions cluster">
  <button class="btn btn--white" type="button" data-open data-magnetic>
    <span class="btn__label">Inspecionar tela</span>
    <span class="btn__icon"><svg width="20" height="20" aria-hidden="true"><use href="#i-arrow"/></svg></span>
  </button>
  <a class="btn btn--ghost" href="#" target="_blank" rel="noopener noreferrer" data-magnetic>
    <span class="btn__label">Repo Demo</span>
    <span class="btn__icon"><svg width="20" height="20" aria-hidden="true"><use href="#i-github"/></svg></span>
  </a>
</div>
```

No cabeçalho do visor modal (`#visor`), um botão persistente `GitHub Showcase` permite que o visitante transite direto da análise de arquitetura para o repositório público correspondente.

### 5.2 Seção Hero de Conexão & Grade Bento de Redes Sociais no Rodapé (`.site-foot`)
Para portfólios de alta qualidade em engenharia de produto, o contato e as redes sociais não devem ser um mero rodapé secundário corporativo. O fechamento da página foi elevado a uma **Seção Hero de Conexão & Redes Sociais de Alto Impacto** diretamente integrada sobre o campo de ondas:

- **Cabeçalho de Chamada**: Título assertivo (*"Vamos conversar ou explorar o código?"*) e subtítulo contextualizando repositórios de IA, parcerias e produtos SaaS.
- **Grade Bento de 4 Cards Grandes em Vidro (`.contact-bento` / `.contact-card`)**:
  1. **GitHub Showcase**: Card com ícone grande, `@usuario`, descrição detalhada de arquitetura e badge com seta *"Explorar repositórios →"*.
  2. **LinkedIn**: Card com `/in/usuario`, artigos de IA e badge *"Conectar no LinkedIn →"*.
  3. **X / Twitter**: Card com `@usuario`, bastidores de build in public e badge *"Seguir no X →"*.
  4. **E-mail Direto**: Card em destaque com gradiente azul safira translúcido, descrição de disponibilidade para projetos e badge *"Enviar mensagem →"*.
- **Efeito Visual**: Vidro translúcido (`rgba(22, 25, 32, 0.55)`), `backdrop-filter: blur(18px)`, cantos suaves (`border-radius: var(--radius-lg)`), bordas de vidro sutil com highlight superior, elevação ao hover (`translateY(-4px)`) e iluminação dinâmica via `.spotlight`.
- **Assinatura Tipográfica**: Nome `Gabriel` em escala monumental fluida (`clamp(4rem, 14vw, 10.5rem)`) logo abaixo da grade bento, selando o fechamento do portfólio.

```html
<div class="contact-bento" aria-label="Redes sociais e contato em destaque">
  <a class="contact-card spotlight" href="#" target="_blank" rel="noopener noreferrer" data-magnetic>
    ...
  </a>
  <a class="contact-card spotlight" href="#" target="_blank" rel="noopener noreferrer" data-magnetic>
    ...
  </a>
  <a class="contact-card spotlight" href="#" target="_blank" rel="noopener noreferrer" data-magnetic>
    ...
  </a>
  <a class="contact-card contact-card--featured spotlight" href="#" data-magnetic>
    ...
  </a>
</div>
```

---

## 6. Checklist de Validação do Sistema (v2.1)

- [x] **Zero Pontilhados nas Margens**: Remoção completa de `border-inline: var(--border-dashed)` da classe `.container`.
- [x] **Bordas Contínuas de Efeito Vidro**: Substituição do estilo `dashed` por bordas contínuas sutis (`1px solid rgba(255, 255, 255, 0.08..0.12)`) e highlight especular superior `inset 0 1px 0 rgba(255, 255, 255, 0.10)`.
- [x] **Escala de Raios Suavemente Arredondados**: Tokens `--radius-xs: 6px`, `--radius-sm: 10px`, `--radius-md: 14px`, `--radius-lg: 18px`, `--radius-xl: 24px`.
- [x] **Menu Flutuante Clean Glass**: Navbar com cantos arredondados, fundo translúcido `rgba(22, 25, 32, 0.58)`, blur 20px, brilho interno superior e links com pílula sutil.
- [x] **Spotlight Curvilíneo**: `border-radius: inherit` aplicado a `.spotlight::after` para acompanhar perfeitamente os cantos arredondados.
- [x] **Hero de Redes Sociais e Contato de Alto Impacto**: Grade Bento com 4 cards grandes (GitHub, LinkedIn, X e E-mail) com glassmorphism, spotlight e elevação tátil.
- [x] **Tipografia Moderna Sem Serifa**: Poppins (Display/Headings), Plus Jakarta Sans (Interface/Corpo), JetBrains Mono (Rótulos).
- [x] **Fundo Cinza Escuro Carbono `#13151a`** com atmosfera azul contínua (Hero e Rodapé).
- [x] **Motor de Ondas Sedoso**: Prata-gelo translúcido, harmônicos senoidais e física de mola amortecida.
- [x] **Telas de Produtos Interativas**: Micro-Demos funcionais dos projetos, com badges de status e link opcional para repositório.
- [x] **Diagrama SVG de Arquitetura**: Pulsos vivos em azul safira e controle de pausa.

