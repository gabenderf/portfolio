/**
 * Todo o texto das seções do site, como dados tipados.
 * Para reescrever o conteúdo, edite só este arquivo: os componentes em src/chrome não têm texto fixo.
 * (Os textos dos projetos ficam em src/projects/<id>/index.ts.)
 */
import type { IconName } from "../chrome/Icons";

export interface NavLinkItem {
  label: string;
  href: string;
}

export type FlowNodeId = "mkt" | "up" | "ext" | "col" | "db" | "motor" | "saas" | "tv";

export interface FlowNode {
  tag: string;
  /** Linhas do rótulo (já quebradas para caber no nó do SVG). */
  lines: string[];
}

export interface ContactCard {
  icon: IconName;
  handle: string;
  title: string;
  desc: string;
  badge: string;
  href: string;
  ariaLabel: string;
  external: boolean;
  featured?: boolean;
  /** Link ainda não definido: renderiza com data-todo e não navega. */
  todo?: boolean;
}

export interface SiteContent {
  nav: {
    brandName: string;
    brandMeta: string;
    menuLabel: string;
    sectionsLabel: string;
    links: NavLinkItem[];
    cta: NavLinkItem;
    skipLabel: string;
  };
  hero: {
    status: string;
    titleLine1: string;
    titleLine2: string;
    lead: string;
    primary: NavLinkItem;
    secondary: NavLinkItem;
  };
  about: {
    tag: string;
    title: string;
    paragraphs: string[];
    timelineLabel: string;
    timeline: { when: string; what: string; text: string }[];
    toolsLabel: string;
    tools: { name: string; use: string }[];
    education: { label: string; title: string; text: string };
  };
  work: { tag: string; title: string; lead: string };
  architecture: {
    tag: string;
    title: string;
    lead: string;
    stepsLabel: string;
    steps: { n: string; label: string; title: string; text: string; bullets: string[] }[];
    pipeline: {
      title: string;
      svgLabel: string;
      pauseButton: string;
      playButton: string;
      pauseAria: string;
      nodes: Record<FlowNodeId, FlowNode>;
    };
  };
  how: {
    tag: string;
    title: string;
    lead: string;
    stepsLabel: string;
    exampleLabel: string;
    siteLabel: string;
    castLabel: string;
    steps: {
      n: string;
      label: string;
      short: string;
      title: string;
      text: string;
      example: string;
      site: string;
      /** índice em `cast` destacado quando a etapa está ativa. */
      cast: number;
    }[];
    cast: { who: string; role: string }[];
  };
  principles: {
    tag: string;
    title: string;
    lead: string;
    items: { n: string; title: string; text: string; origin: string[] }[];
  };
  contact: {
    kicker: string;
    title: string;
    lead: string;
    bentoLabel: string;
    cards: ContactCard[];
    status: {
      title: string;
      items: { state: string; tone: "run" | "test" | "none"; text: string }[];
    };
  };
  footer: {
    links: NavLinkItem[];
    name: string;
    credit: string;
  };
}

export const site: SiteContent = {
  nav: {
    brandName: "Gabriel",
    brandMeta: "Operações · Automação · IA",
    menuLabel: "Menu",
    sectionsLabel: "Seções",
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Projetos", href: "#trabalho" },
      { label: "Plataforma", href: "#plataforma" },
      { label: "Como trabalho", href: "#como-trabalho" },
    ],
    cta: { label: "Contato", href: "#contato" },
    skipLabel: "Ir para os projetos",
  },

  hero: {
    status: "Operações de e-commerce · IA aplicada",
    titleLine1: "Entendo o processo.",
    titleLine2: "Depois, construo a solução.",
    lead:
      "Sou Gabriel. Coordeno a operação digital de uma distribuidora e desenvolvo, com IA, as ferramentas que a operação usa todo dia: " +
      "painéis, extensões, automações e previsões. Abaixo estão os sistemas que construí para a expedição da Hope, com as telas reais rodando no seu navegador.",
    primary: { label: "Ver os projetos", href: "#trabalho" },
    secondary: { label: "Sobre mim", href: "#sobre" },
  },

  about: {
    tag: "Sobre",
    title: "Da operação para o código.",
    paragraphs: [
      "Tenho mais de 4 anos de experiência em operações de e-commerce e hoje coordeno a operação digital de uma distribuidora. " +
        "Comecei no design gráfico, passei pelo marketing digital e encontrei nas operações aquilo de que mais gosto: entender por que um processo falha e construir a solução.",
      "Nos últimos tempos, a IA virou minha principal ferramenta de trabalho. Com ela desenvolvo automações, dashboards e ferramentas internas " +
        "que hoje são usadas no dia a dia da empresa. Conheço o problema por dentro, porque estou na operação; a IA me permite ir do diagnóstico ao sistema funcionando.",
    ],
    timelineLabel: "Trajetória",
    timeline: [
      { when: "Início", what: "Design gráfico", text: "Identidade visual, peças e o olhar para interface que uso até hoje." },
      { when: "Depois", what: "Marketing digital", text: "Campanhas, conteúdo e o primeiro contato com dados e métricas." },
      { when: "4+ anos", what: "Operações de e-commerce", text: "Expedição, marketplaces e processos. Hoje coordeno a operação digital de uma distribuidora." },
      { when: "Agora", what: "Ferramentas com IA", text: "Painéis, extensões e automações em uso diário, construídos com agentes de IA." },
    ],
    toolsLabel: "Ferramentas do dia a dia",
    tools: [
      { name: "Claude Code", use: "desenvolvimento com agentes" },
      { name: "Antigravity", use: "desenvolvimento e revisão" },
      { name: "Grok", use: "pesquisa e apoio" },
      { name: "n8n", use: "automações e integrações" },
      { name: "Supabase", use: "banco, login e permissões" },
      { name: "React e TypeScript", use: "painéis e interfaces" },
    ],
    education: {
      label: "Formação",
      title: "Bacharelado em Tecnologia da Informação · UNIVESP",
      text: "Cursando o 3º semestre.",
    },
  },

  work: {
    tag: "Projetos",
    title: "Quatro sistemas, uma operação.",
    lead:
      "Construí a Plataforma Hope para a expedição de um e-commerce que envia de 700 a 1.500 pedidos por dia. " +
      "As telas abaixo não são prints: são os próprios sistemas, em modo demonstração, com dados fictícios e sem conexão com o banco.",
  },

  architecture: {
    tag: "A plataforma",
    title: "Do pedido no marketplace à tela da liderança.",
    lead:
      "O UpSeller, ERP de terceiros, não tem relatório por operador nem previsão de término. A plataforma lê o que ele mostra, guarda no banco e calcula em cima. Cinco passos, na ordem em que o dado anda.",
    stepsLabel: "Passos do fluxo da plataforma",
    steps: [
      {
        n: "01",
        label: "Origem",
        title: "Pedidos e prazo vêm dos marketplaces.",
        text: "A Shopee responde por cerca de 99% dos pedidos, o TikTok Shop por cerca de 1%. O UpSeller agrega os canais e mostra o prazo de envio, que na verdade é definido pela Shopee.",
        bullets: [
          "700 a 1.500 pedidos por dia útil; a terça recebe o acúmulo de domingo e segunda (~1.348).",
          "Fluxo do pedido no UpSeller: Para Emitir, Para Enviar, Para Imprimir, bancada (bipagem), Para Retirada ou Enviado.",
        ],
      },
      {
        n: "02",
        label: "Captura",
        title: "Duas extensões leem o que a tela mostra.",
        text: "A extensão roda no PC de cada bancada e grava cada bipagem. O coletor roda no PC da liderança, raspa a fila do dia e grava a falha em vez de escondê-la.",
        bullets: [
          "Extensão: bipagem em pedidos_separados, entradas e saídas em logs_acesso; lê a meta global a cada 60 s.",
          "Coletor: cabeçalho em fila_snapshots (ok, incompleto ou erro) e um pedido por linha em fila_snapshot_itens.",
        ],
      },
      {
        n: "03",
        label: "Banco",
        title: "O Supabase impõe as regras.",
        text: "Postgres com RLS por perfil, Auth com MFA e Edge Functions. Bipagens e acessos são append-only: o banco recusa UPDATE e DELETE. Quem mudou o quê fica em auditoria, escrita por trigger.",
        bullets: [
          "Views: fila_do_dia (denominador), fila_pendente (diferença de conjuntos contra o que foi bipado) e demanda_sku_dia.",
          "Escrevem: extensão (bipagens, acessos), coletor (fila, previsão), SaaS (metas, equipe, usuários, dispositivos).",
        ],
      },
      {
        n: "04",
        label: "Motor",
        title: "A previsão é uma função pura, em três lugares.",
        text: "Simulação de 5 em 5 minutos sobre a fila pendente. O coletor congela a meta do dia de manhã; o SaaS recalcula a previsão viva com o mesmo código. Calibrado com 15.000 pedidos reais.",
        bullets: [
          "Fonte única em previsao-expedicao; coletor e SaaS carregam cópias, sem build.",
          "A meta publicada usa o p50 (revisado em 18/08/2026).",
        ],
      },
      {
        n: "05",
        label: "Telas",
        title: "Hope SaaS e Modo TV leem do banco.",
        text: "O Hope SaaS é o painel da liderança em React 19. O Modo TV é uma rota do próprio SaaS, aberta na TV do galpão com credencial de dispositivo pareada por código. As extensões leem de volta a meta global.",
        bullets: [
          "O SaaS roda local; MFA, RLS, auditoria e pareamento foram conferidos de ponta a ponta no projeto Supabase de teste.",
          "A produção ainda não foi migrada.",
        ],
      },
    ],
    pipeline: {
      title: "Fluxo da Plataforma Hope · quem escreve, quem lê",
      svgLabel:
        "Diagrama: marketplaces alimentam o UpSeller; a extensão das bancadas e o coletor de fila gravam no Supabase; o motor de previsão calcula sobre o banco; Hope SaaS e Modo TV mostram o resultado.",
      pauseButton: "Pausar",
      playButton: "Reproduzir",
      pauseAria: "Pausar animação do fluxo de dados",
      nodes: {
        mkt: { tag: "ORIGEM", lines: ["Marketplaces", "Shopee · TikTok"] },
        up: { tag: "TERCEIROS", lines: ["UpSeller", "ERP no Chrome"] },
        ext: { tag: "BANCADAS", lines: ["Extensão das", "bancadas"] },
        col: { tag: "LIDERANÇA", lines: ["Coletor", "de fila"] },
        db: { tag: "SUPABASE", lines: ["Postgres + RLS", "Auth com MFA", "Edge Functions", "views da fila"] },
        motor: { tag: "MOTOR", lines: ["Previsão do dia", "passo de 5 min"] },
        saas: { tag: "TELA", lines: ["Hope SaaS", "painel React"] },
        tv: { tag: "TELA", lines: ["Modo TV", "pareado"] },
      },
    },
  },

  how: {
    tag: "Como trabalho",
    title: "IA como ferramenta, com processo em volta.",
    lead:
      "Uso agentes de IA para escrever o código; o meu trabalho é o que torna o resultado confiável: definir o problema, dividir o trabalho, revisar com outro modelo e provar com testes antes de colocar na operação. " +
      "Este portfólio foi feito do mesmo jeito. Clique numa etapa para ver o exemplo na Plataforma Hope e o que aconteceu aqui.",
    stepsLabel: "Etapas do processo de desenvolvimento",
    exampleLabel: "Na Plataforma Hope",
    siteLabel: "Neste portfólio",
    castLabel: "Quem fez este site",
    steps: [
      {
        n: "01",
        label: "Contrato",
        short: "Antes do código",
        title: "O orquestrador escreve o contrato antes de qualquer agente começar.",
        text: "Tipos, pastas, o que cada frente pode tocar e o que só muda com o orquestrador. Um agente que precisa de uma dependência nova pede, não adiciona.",
        example:
          "Arquivos de contrato que só mudam com o orquestrador; ESLint barrando acesso ao banco fora de três pastas; um CLAUDE.md por projeto com as decisões já tomadas, para ninguém repetir a discussão.",
        site: "Um modelo orquestrador (Claude Opus) escreveu o contrato do site e dividiu o trabalho: um sistema por frente, cada um numa pasta própria.",
        cast: 0,
      },
      {
        n: "02",
        label: "Execução",
        short: "Frentes em paralelo",
        title: "Cada agente executa uma frente, sem pisar na do outro.",
        text: "As frentes rodam ao mesmo tempo. O contrato é o que permite juntar o resultado no fim sem reescrever nada.",
        example:
          "Trechos de segurança do Hope SaaS foram feitos por um agente dedicado, identificados como acréscimos no código, enquanto outras frentes seguiam.",
        site: "Agentes (Claude Sonnet) construíram cada sistema do portfólio em paralelo, cada um só dentro da própria pasta.",
        cast: 1,
      },
      {
        n: "03",
        label: "Revisão",
        short: "Olhar independente",
        title: "Quem revisa não é quem escreveu.",
        text: "A revisão independente acha o que o autor não vê. Cada ponto encontrado é tratado ou justificado por escrito.",
        example: "Uma revisão independente do Hope SaaS encontrou 25 pontos; todos foram tratados.",
        site: "Um revisor de outro fornecedor (Gemini) revisou cada entrega antes de ela entrar no site.",
        cast: 2,
      },
      {
        n: "04",
        label: "Verificação",
        short: "Prova, não opinião",
        title: "Funciona quando um teste ou uma conferência diz que funciona.",
        text: "Testes automatizados, conferências contra o projeto Supabase de teste e testes de ponta a ponta com Chrome headless. Produção é só leitura; escrita e migrations só no projeto de teste.",
        example:
          "Mais de 500 testes automatizados; 44 conferências de RLS e 75 de pareamento por perfil; testes de ponta a ponta com 42 e 32 conferências; paridade com o código antigo em ~4.500 SKUs.",
        site: "Cada agente checou tipos e abriu a própria seção no Chrome em 1440 e 390 px de largura, olhando captura de tela e console.",
        cast: 1,
      },
      {
        n: "05",
        label: "Entrega",
        short: "Fechamento",
        title: "Uma última revisão fecha o projeto.",
        text: "Segredos fora do git, nada de commit sem o dono pedir e o estado real descrito no próprio texto: o que roda, o que está em teste, o que não existe.",
        example:
          "Arquivos .env fora do repositório; URL e chave de produção nunca em resposta, log ou documento; o corte da arquitetura inicial escrito com rollback no próprio SQL.",
        site: "Uma revisão final fechou o projeto: texto contra o briefing, conteúdo proibido e consistência entre as seções.",
        cast: 3,
      },
    ],
    cast: [
      { who: "Claude Opus", role: "Orquestrador: contrato e divisão do trabalho" },
      { who: "Claude Sonnet", role: "Agentes: um sistema por frente, em paralelo" },
      { who: "Gemini", role: "Revisor de outro fornecedor, por entrega" },
      { who: "Revisão final", role: "Fecha o projeto" },
      { who: "Gabriel", role: "Produto: decisões, conteúdo e aprovação de cada entrega" },
    ],
  },

  principles: {
    tag: "Princípios",
    title: "Como eu decido.",
    lead: "Regras que aprendi na prática e que se repetem nos quatro projetos. Cada uma traz o projeto de onde saiu.",
    items: [
      {
        n: "01",
        title: "Uma definição por conceito.",
        text: "O ritmo vive em um arquivo. A Previsão replicou a fórmula da Visão Geral em vez de melhorá-la, porque dois números com o mesmo nome destroem a confiança nos dois.",
        origin: ["Hope SaaS", "Motor de previsão"],
      },
      {
        n: "02",
        title: "Duas fontes independentes antes de confiar num número.",
        text: "O capturado contra o total do rodapé; a fila contra o que foi bipado. A pergunta fixa: como eu saberia se este número estivesse errado?",
        origin: ["Motor de previsão", "Coletor de fila"],
      },
      {
        n: "03",
        title: "Falhar visível em vez de silencioso.",
        text: "Raspagem incompleta é gravada como incompleta, sub-aba errada aborta, janela coberta para e registra o motivo, leitura truncada recusa gravar a previsão.",
        origin: ["Coletor de fila"],
      },
      {
        n: "04",
        title: "Segurança no banco, não na tela.",
        text: "MFA obrigatório exigido pela função de permissão, permissões relidas a cada consulta, revogação imediata e auditoria por trigger. A tela só reflete.",
        origin: ["Hope SaaS"],
      },
      {
        n: "05",
        title: "Transição sem parar a operação.",
        text: "Versão com fallback, coletor pareado primeiro, uma bancada por um dia inteiro, corte fora do expediente e rollback escrito no próprio SQL do corte.",
        origin: ["Extensão das bancadas", "Coletor de fila", "Hope SaaS"],
      },
      {
        n: "06",
        title: "Não pintar pessoa de vermelho por algo que não é culpa dela.",
        text: "O produto também é decisão de justiça, não só de código. No painel da liderança, ninguém fica vermelho por desempenho.",
        origin: ["Hope SaaS"],
      },
    ],
  },

  contact: {
    kicker: "Contato",
    title: "Vamos conversar?",
    lead:
      "Se a sua empresa tem processos que travam, dados que ninguém confia ou trabalho manual demais, eu gosto desse tipo de problema. " +
      "O jeito mais rápido de falar comigo é pelo LinkedIn.",
    bentoLabel: "Canais de contato",
    cards: [
      {
        icon: "linkedin",
        handle: "in/gabrielandersonf",
        title: "LinkedIn",
        desc: "Trajetória profissional, experiência e o melhor canal para conversar.",
        badge: "Abrir perfil",
        href: "https://www.linkedin.com/in/gabrielandersonf/",
        ariaLabel: "LinkedIn de Gabriel (abre em nova aba)",
        external: true,
        featured: true,
      },
      {
        icon: "github",
        handle: "@gabenderf",
        title: "GitHub",
        desc: "O código deste portfólio e dos projetos que forem publicados.",
        badge: "Ver repositórios",
        href: "https://github.com/gabenderf",
        ariaLabel: "GitHub de Gabriel (abre em nova aba)",
        external: true,
      },
      {
        icon: "x",
        handle: "@gbrandfl",
        title: "X",
        desc: "Notas curtas sobre o que estou construindo com IA.",
        badge: "Seguir",
        href: "https://x.com/gbrandfl",
        ariaLabel: "X de Gabriel (abre em nova aba)",
        external: true,
      },
    ],
    status: {
      title: "Onde cada sistema está hoje",
      items: [
        {
          state: "Em uso na operação",
          tone: "run",
          text: "Extensão das bancadas, coletor da fila e motor de previsão rodam na expedição, na versão anterior da plataforma, em produção assistida.",
        },
        {
          state: "Validado em teste",
          tone: "test",
          text: "Hope SaaS, com permissões, MFA, auditoria e pareamento conferidos de ponta a ponta em ambiente de teste. A migração para produção é o próximo passo.",
        },
        {
          state: "Nesta página",
          tone: "none",
          text: "Tudo roda no seu navegador com dados fictícios. Nenhum dado real da operação aparece aqui.",
        },
      ],
    },
  },

  footer: {
    links: [
      { label: "Sobre", href: "#sobre" },
      { label: "Projetos", href: "#trabalho" },
      { label: "Plataforma", href: "#plataforma" },
      { label: "Como trabalho", href: "#como-trabalho" },
      { label: "Topo", href: "#topo" },
    ],
    name: "Gabriel",
    credit: "Feito com Claude Code · 2026",
  },
};
