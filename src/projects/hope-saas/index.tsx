/* Hope SaaS: painel de expedição da liderança.
   As telas são o próprio sistema, em modo demonstração (dados gerados no navegador, sem banco),
   publicado em public/demo/hope por `npm run build:hope-demo`. */
import type { Project } from "../types";
import { HOPE_DEMO_BASE, LiveDemo } from "../../work/LiveDemo";

const live = (path: string, title: string) =>
  function LiveScreen() {
    return <LiveDemo path={path} title={title} />;
  };

const project: Project = {
  id: "hope-saas",
  order: 1,
  layout: "feature",
  kicker: "01 · Painel da liderança",
  title: "Hope SaaS",
  lead: "O painel que a liderança da expedição usa para acompanhar o dia: pedidos separados, ritmo de cada operador contra a meta, previsão de término da fila e um Modo TV para o galpão. O que você vê ao lado é o sistema de verdade, em modo demonstração.",
  context: [
    "A operação expede de 700 a 1.500 pedidos por dia útil, quase todos de marketplace. O ERP que agrega os pedidos não mostra produtividade por operador nem a hora em que a fila do dia acaba. A liderança precisava dessas respostas, e de saber quem mudou uma meta e quando.",
    "O painel anterior era um site estático de protótipo, com bugs de fuso horário e duas fórmulas diferentes de ritmo com o mesmo nome. O Hope SaaS substitui esse painel com uma base sólida: permissões por perfil no banco, login com MFA, auditoria e pareamento de TV por código.",
    "Estado atual: o sistema está validado de ponta a ponta num ambiente de teste e a migração para produção é o próximo passo. A demonstração ao lado roda inteira no seu navegador, com dados fictícios gerados na hora.",
  ],
  concepts: [
    {
      title: "Ritmo com uma definição só",
      text: "Num mesmo instante, duas telas mostravam 48,9/h e 39,2/h, porque cada uma calculava de um jeito. Hoje o ritmo vive em um único arquivo, e todas as telas usam a mesma função.",
    },
    {
      title: "Ninguém fica vermelho por desempenho",
      text: "Até 15% abaixo da meta não tem cor; abaixo disso, âmbar. Vermelho é só para falha de sistema. Em dia de fila curta todo mundo cai junto, sem ser culpa de ninguém.",
    },
    {
      title: "Segurança no banco, não só na tela",
      text: "As permissões são impostas pelo Postgres (RLS por perfil), com MFA obrigatório para administração e liderança. A auditoria é feita por trigger, então o histórico não depende da interface.",
    },
    {
      title: "Modo TV sem login de pessoa",
      text: "A TV do galpão mostra um código, um administrador aprova e o aparelho entra com credencial própria, só de leitura e revogável na hora. Nenhuma sessão pessoal fica esquecida no galpão.",
    },
  ],
  stack: ["React 19", "TypeScript", "Tailwind", "TanStack Query", "Recharts", "Supabase (Postgres, Auth, RLS)", "Vitest"],
  metrics: [
    { label: "Telas e áreas", value: "15", sub: "incluindo Modo TV e login com MFA" },
    { label: "Testes automatizados", value: "500+", sub: "regras de negócio cobertas" },
    { label: "Conferências no banco", value: "119", sub: "permissões e pareamento" },
  ],
  arch: [
    "As telas só usam hooks de dados; apenas três pastas falam com o banco, e o lint barra o resto.",
    "Uma variável de ambiente troca a fonte: dados de demonstração (esta página) ou dados reais.",
    "Ritmo, meta efetiva e dia de São Paulo saem de módulos puros e testados.",
    "O banco aplica RLS por perfil e exige MFA; toda alteração gera auditoria.",
  ],
  repo: null,
  demoUrl: `${HOPE_DEMO_BASE}expedicao`,
  screens: [
    { id: "visao-geral", label: "Visão Geral", url: "hope / expedição", hint: "Sistema real · navegue à vontade", Component: live("expedicao", "Hope SaaS: Visão Geral") },
    { id: "previsao", label: "Previsão", url: "hope / expedição / previsão", hint: "Sistema real · modo demo", Component: live("expedicao/previsao", "Hope SaaS: Previsão") },
    { id: "metas", label: "Metas", url: "hope / expedição / metas", hint: "Sistema real · modo demo", Component: live("expedicao/metas", "Hope SaaS: Metas") },
    { id: "modo-tv", label: "Modo TV", url: "hope / tv", hint: "A tela da TV do galpão", Component: live("tv", "Hope SaaS: Modo TV") },
  ],
};

export default project;
