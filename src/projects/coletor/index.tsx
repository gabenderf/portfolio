/* Coletor da fila (coletor-fila). O popup usa o HTML e o CSS reais da extensão (public/demo/ext/coletor);
   a "Rodada" é uma simulação explicativa de como a leitura da lista funciona e falha. */
import type { Project } from "../types";
import { LiveDemo } from "../../work/LiveDemo";
import { RodadaScreen } from "./RodadaScreen";
import "./styles.css";

function Popup() {
  return <LiveDemo src={`${import.meta.env.BASE_URL}demo/ext/coletor/popup.html`} title="Coletor da fila: popup" desktopWidth={320} />;
}

const project: Project = {
  id: "coletor",
  order: 3,
  layout: "stack",
  kicker: "03 · Coleta de dados",
  title: "Coletor da fila",
  lead: "Extensão que lê a fila de pedidos pendentes de um ERP sem exportação, confere o que leu contra o total da tela e grava a falha em vez de escondê-la. Alimenta a previsão do dia.",
  context: [
    "Para saber a que horas a fila do dia acaba, é preciso saber o que está pendente. Essa informação só existe nas telas do ERP, sem exportação utilizável em tempo real. O coletor lê essas telas, guarda cada leitura no banco e roda o motor de previsão.",
    "A lista do ERP só mostra cerca de 20 pedidos por vez na tela. A maior parte do trabalho foi descobrir como uma leitura pode parecer saudável e estar errada, e fazer cada um desses casos falhar de forma visível.",
  ],
  concepts: [
    {
      title: "Ler uma lista que só mostra 20 itens",
      text: "A leitura avança em passos, acumula e remove repetidos pelo número do pedido. O critério de parada é o total que a própria tela informa, não o fim da rolagem.",
    },
    {
      title: "Falhar visível, não silencioso",
      text: "O que foi lido é comparado com o contador da tela. Leitura incompleta é gravada como incompleta, com o motivo; sessão expirada é erro explícito.",
    },
    {
      title: "Roda sozinho",
      text: "Alarmes agendam as coletas, uma rotina de recuperação limpa coletas interrompidas e um vigia destrava a que parar no meio.",
    },
  ],
  stack: ["JavaScript", "Chrome Manifest V3", "Service worker", "Supabase", "Puppeteer"],
  metrics: [
    { label: "Leitura real validada", value: "1.158/1.158", sub: "pedidos conferidos" },
    { label: "Teste ponta a ponta", value: "32/32", sub: "conferências" },
  ],
  arch: [
    "Um alarme (ou o botão do popup) acorda a extensão, que abre as telas da fila numa janela própria.",
    "A leitura rola a lista, acumula os pedidos sem repetir e confere cada página com o total da tela.",
    "Cada coleta vira um registro (ok, incompleto ou erro) com o motivo da parada.",
    "Com a leitura conferida, o motor de previsão calcula o término do dia.",
  ],
  repo: null,
  screens: [
    { id: "popup", label: "Popup", url: "chrome-extension / popup", hint: "Clique em Coletar dados agora", Component: Popup },
    { id: "rodada", label: "Como a leitura funciona", url: "simulação", hint: "Ligue uma falha e inicie a rodada", Component: RodadaScreen },
  ],
};

export default project;
