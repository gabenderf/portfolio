/* Extensão das bancadas (upseller-extension).
   As telas usam o HTML e o CSS reais da extensão (public/demo/ext/bancada), com dados fictícios. */
import type { Project } from "../types";
import { LiveDemo } from "../../work/LiveDemo";

const EXT = `${import.meta.env.BASE_URL}demo/ext/bancada/`;

function Painel() {
  return <LiveDemo src={`${EXT}painel.html`} title="Extensão das bancadas: painel flutuante" desktopWidth={720} />;
}
function Popup() {
  return <LiveDemo src={`${EXT}popup.html`} title="Extensão das bancadas: popup" desktopWidth={360} />;
}

const project: Project = {
  id: "bancada",
  order: 2,
  layout: "stack",
  kicker: "02 · Chão do galpão",
  title: "Extensão das bancadas",
  lead: "Uma extensão do navegador instalada em cada bancada da expedição, que mostra ao operador quanto ele já produziu no dia.",
  story: {
    before: "Os operadores queriam saber quanto estavam produzindo no dia, e o ERP não mostrava isso para eles.",
    after:
      "A extensão roda em cada bancada, registra cada pedido bipado e mostra ao operador o próprio ritmo contra a meta. Também virou a fonte de dados de toda a plataforma.",
    result: "+43% de produtividade da equipe depois da implantação.",
  },
  context: [
    "O ERP usado na expedição não mede produtividade: não há relatório por operador nem registro de quem bipou o quê. Sem esse dado, a liderança não tinha como acompanhar o ritmo do dia.",
    "Sem integração oficial disponível, a extensão roda dentro da tela de checkout de cada bancada e lê o que o ERP já mostra. Cada etiqueta bipada vira um registro com operador, bancada, pedido e itens, que alimenta o painel da liderança e a previsão.",
    "Para o operador, um painel flutuante mostra pedidos do dia, média por hora e progresso contra a meta, com mensagens de incentivo. É o que está ao lado, com o HTML e o CSS reais da extensão.",
  ],
  concepts: [
    {
      title: "Leitura de tela, sem API",
      text: "As colunas são localizadas pelo texto do cabeçalho, nunca pela posição. Um campo extra faltando nunca impede de gravar uma bipagem.",
    },
    {
      title: "Bipar duas vezes não duplica",
      text: "A chave é o código de rastreio: inserir ou ignorar, nunca atualizar. O banco só aceita leitura e inclusão nessa tabela.",
    },
    {
      title: "Meta ajustada pela liderança",
      text: "A liderança muda a meta do dia no painel e todas as bancadas seguem em até um minuto, sem reinstalar nada.",
    },
    {
      title: "Transição sem parar a operação",
      text: "Testes de ponta a ponta com Chrome automatizado e instalação máquina a máquina fora do turno, para a expedição nunca parar.",
    },
  ],
  stack: ["JavaScript", "Chrome Manifest V3", "Service worker", "Supabase", "Puppeteer"],
  metrics: [
    { label: "Atualização da meta", value: "60 s", sub: "todas as bancadas" },
    { label: "Teste ponta a ponta", value: "42/42", sub: "conferências" },
  ],
  arch: [
    "O content script observa a tabela de checkout e lê rastreio, pedido, SKU e total.",
    "O service worker grava a bipagem no banco, sem duplicar.",
    "Cada máquina tem credencial própria, pareada por código no Hope SaaS.",
    "O painel da liderança lê os mesmos registros para ranking, relatórios e previsão.",
  ],
  repo: "https://github.com/gabenderf/upseller-extension-demo",
  screens: [
    { id: "painel", label: "Painel flutuante", url: "erp / checkout", hint: "Clique em Bipar etiqueta", Component: Painel },
    { id: "popup", label: "Popup e pareamento", url: "chrome-extension / popup", hint: "Clique em Parear bancada", Component: Popup },
  ],
};

export default project;
