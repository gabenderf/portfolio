/* Motor de previsão (previsao-expedicao). As duas primeiras telas são o Hope SaaS real em modo demo
   (abas Previsão e Planejamento, que rodam o motor); simulador e falhas são simulações explicativas.
   Lógica pura das simulações em ./model.ts, dados em ./data.ts. */
import type { Project } from "../types";
import { HOPE_DEMO_BASE, LiveDemo } from "../../work/LiveDemo";
import { SimuladorScreen } from "./SimuladorScreen";
import { FalhasScreen } from "./FalhasScreen";
import "./styles.css";

const live = (path: string, title: string) =>
  function LiveScreen() {
    return <LiveDemo path={path} title={title} />;
  };

const project: Project = {
  id: "previsao",
  order: 4,
  layout: "feature",
  kicker: "04 · Previsão",
  title: "Motor de previsão",
  lead: "Responde à pergunta que a liderança faz todo dia: a que horas o trabalho obrigatório acaba? Roda dentro do painel, nas abas Previsão e Planejamento, que você vê ao lado.",
  story: {
    before: "O planejamento era feito na base da intuição. Nem os marketplaces nem o ERP oferecem previsão ou insights.",
    after:
      "Uma simulação de 5 em 5 minutos, calibrada com 15.000 pedidos reais, responde a que horas a fila obrigatória acaba e se sobra gente para outro setor.",
    result: "A liderança decide a escala do dia com dados, e não no achismo.",
  },
  context: [
    "A pergunta da liderança é simples: a que horas a fila obrigatória acaba, e isso acontece antes do fim do turno? Se sobra capacidade, dá para liberar gente para outro setor. O UpSeller não responde nenhuma das duas.",
    "É difícil porque a fila não é um número parado. Pedidos continuam chegando ao longo da manhã, o pago até 13h precisa sair no mesmo dia, e a terça acumula domingo e segunda (cerca de 1.348 pedidos, o dobro de quarta, quinta e sexta). Dividir volume por capacidade erra justamente nos dias que importam, então o motor simula a fila passo a passo.",
    "O motor roda em dois lugares, com a mesma função: o coletor executa na primeira coleta do dia e congela a meta, e o Hope SaaS recalcula a previsão viva nas abas Previsão e Planejamento. As duas primeiras telas ao lado são o painel real em modo demonstração; as outras duas são simulações feitas para explicar a lógica que o painel não mostra.",
    "As regras vêm de medições em 15.000 pedidos reais (21/07 a 15/08/2026). O padrão de erro do projeto não foi exceção, foi número plausível e errado: por isso cada armadilha encontrada está documentada com o número que a revelou.",
  ],
  concepts: [
    {
      title: "Simulação em passos de 5 minutos",
      text: "A fila é consumida passo a passo, com as chegadas repartidas por uma curva horária. Isso dá o horário de término, o piso pós-almoço sem número mágico e as janelas ociosas, coisas que uma divisão volume ÷ capacidade não enxerga.",
    },
    {
      title: "Função pura, copiada sem edição",
      text: "O motor não usa relógio implícito, rede nem DOM: o instante entra por parâmetro. Sem build step, ele é distribuído por cópia de arquivo para o coletor (idêntico por hash) e para o painel (lógica idêntica, só o cabeçalho difere). Corrige-se apenas na fonte.",
    },
    {
      title: "p50 publicado, p90 calculado",
      text: "A meta usa o p50. A faixa pessimista (p90, ritmo × 0,75) saiu da tela porque mostrar \"termina entre 14h40 e 16h40\" enquanto se cobra um piso de 35/h era incoerente. A decisão original era p90 e foi revisada em 18/08/2026; o viés conservador ficou num lugar só, a equipe padrão de 3 pessoas.",
    },
    {
      title: "Comparar duas fontes antes de confiar",
      text: "A fila é o conjunto de pedidos vistos no dia menos o conjunto de bipagens, por diferença de conjuntos e chave dupla, não um contador que o UpSeller só baixa quando alguém clica em Enviar. A pergunta fixa: como eu saberia se este número estivesse errado?",
    },
    {
      title: "Teto de 1.000 linhas e leitura paginada",
      text: "O PostgREST corta respostas em 1.000 linhas sem avisar. Uma fila de 1.160 chegou como 1.000, e o motor inventou 160 chegadas futuras. Toda lista que pode passar de 1.000 linhas é lida paginada, e o resultado de exatamente 1.000 é tratado como suspeito.",
    },
    {
      title: "Documentar o que foi descartado",
      text: "Hipóteses refutadas, o almoço que não deve ser descontado duas vezes, o piso do filtro que não conserta o histórico: tudo fica registrado com a medição. Um alarme também é código e tem teste, feito com os dados dos dias em que errou.",
    },
  ],
  stack: ["JavaScript", "Node.js", "PostgreSQL", "SQL"],
  metrics: [
    { label: "Pedidos na calibração", value: "15.000", sub: "21/07 a 15/08/2026" },
    { label: "Passo da simulação", value: "5 min", sub: "a mesma função no coletor e no painel" },
  ],
  arch: [
    "O coletor lê a fila do UpSeller e grava cada etapa como um snapshot (ok, incompleto ou erro).",
    "As views derivam a fila do dia e a fila pendente por diferença de conjuntos, com chave dupla.",
    "Antes de gravar, uma conferência compara duas fontes; se a leitura está truncada ou inconsistente, não grava.",
    "O motor, função pura, simula a fila em passos de 5 minutos e devolve término, ritmo necessário e janelas ociosas.",
    "Na primeira coleta de dados do dia, o coletor congela a meta; as seguintes só atualizam a previsão viva.",
    "O painel recalcula a previsão viva com a mesma função e mostra a divergência entre a meta e a realidade.",
  ],
  repo: "https://github.com/gabenderf/previsao-expedicao-demo",
  demoUrl: `${HOPE_DEMO_BASE}expedicao/previsao`,
  screens: [
    { id: "previsao", label: "Previsão", url: "hope / expedição / previsão", hint: "Sistema real · modo demo", Component: live("expedicao/previsao", "Hope SaaS: Previsão") },
    { id: "planejamento", label: "Planejamento", url: "hope / expedição / planejamento", hint: "Sistema real · modo demo", Component: live("expedicao/planejamento", "Hope SaaS: Planejamento") },
    {
      id: "simulador",
      label: "Como o motor funciona",
      url: "simulação",
      hint: "Simulação explicativa · arraste o ritmo",
      Component: SimuladorScreen,
    },
    {
      id: "falhas",
      label: "Plausível e errado",
      url: "simulação",
      hint: "Simulação explicativa · clique num caso",
      Component: FalhasScreen,
    },
  ],
};

export default project;
