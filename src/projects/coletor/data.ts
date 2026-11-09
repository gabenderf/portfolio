/** Dados fictícios do Coletor da fila (briefing 4.8). Nenhum pedido, SKU ou horário é real. */
import type { EtapaId, Motivo, Status } from "./model";

/* ---------- pedidos e SKUs fictícios ---------- */
const SKUS = [
  "3X-LENC-DESC-70X50",
  "TOUCA-DESC-100UN",
  "LUVA-PROC-M-100UN",
  "SERINGA-10ML-LL",
  "ATADURA-CREP-10CM",
  "GAZE-EST-7X7-10UN",
  "MASCARA-TRI-50UN",
  "2X-LUVA-PROC-G-100UN",
];

/** Número de pedido fictício no formato do exemplo do briefing (UP100K000417). */
export function pedidoDe(etapa: EtapaId, pos: number): { num: string; sku: string; prazo: string } {
  const n = (etapa === "para_enviar" ? 410 : 1) + pos;
  const num = `UP100K${String(n).padStart(6, "0")}`;
  const sku = SKUS[(pos * 5 + (etapa === "para_enviar" ? 3 : 0)) % SKUS.length];
  const horasTotais = 4 + ((pos * 37) % 52);
  const d = Math.floor(horasTotais / 24);
  const h = horasTotais % 24;
  const m = (pos * 13) % 60;
  const prazo = d > 0 ? `${d}d ${String(h).padStart(2, "0")}h` : `${h}h ${String(m).padStart(2, "0")}m`;
  return { num, sku, prazo };
}

/* ---------- histórico de snapshots do dia (4.8) ---------- */
export interface LinhaSnapshot {
  rodada: string;
  hora: string;
  etapa: EtapaId;
  status: Status;
  capturado: number;
  esperado: number | null;
  paginas: number;
  motivo: Motivo;
}

export const SNAPSHOTS_DO_DIA: LinhaSnapshot[] = [
  { rodada: "20261110-0759", hora: "07:59", etapa: "para_enviar", status: "ok", capturado: 8, esperado: 8, paginas: 1, motivo: "total_atingido" },
  { rodada: "20261110-0759", hora: "07:59", etapa: "para_imprimir", status: "ok", capturado: 1004, esperado: 1004, paginas: 4, motivo: "total_atingido" },
  { rodada: "20261110-0900", hora: "09:00", etapa: "para_enviar", status: "ok", capturado: 3, esperado: 3, paginas: 1, motivo: "total_atingido" },
  { rodada: "20261110-0900", hora: "09:00", etapa: "para_imprimir", status: "ok", capturado: 931, esperado: 931, paginas: 4, motivo: "total_atingido" },
  { rodada: "20261110-1000", hora: "10:00", etapa: "para_imprimir", status: "incompleto", capturado: 786, esperado: 940, paginas: 3, motivo: "janela_oculta" },
  { rodada: "20261110-1004", hora: "10:04", etapa: "para_imprimir", status: "ok", capturado: 792, esperado: 792, paginas: 3, motivo: "total_atingido" },
];

/* ---------- popup: as rodadas do dia, em ordem ---------- */
export interface RodadaDoDia {
  hora: string;
  minutos: number;
  enviar?: { c: number; e: number };
  imprimir: { c: number; e: number; pag: number; motivo: Motivo };
  /** insumos da previsão (só valem quando a rodada fecha completa) */
  obrigatorios: number;
  pendentes: number;
  chegadasRestantes: number;
  vencidos: number;
  amanha: number;
}

export const RODADAS_DO_DIA: RodadaDoDia[] = [
  {
    hora: "07:59",
    minutos: 7 * 60 + 59,
    enviar: { c: 8, e: 8 },
    imprimir: { c: 1004, e: 1004, pag: 4, motivo: "total_atingido" },
    obrigatorios: 640,
    pendentes: 1012,
    chegadasRestantes: 177,
    vencidos: 0,
    amanha: 360,
  },
  {
    hora: "09:00",
    minutos: 9 * 60,
    enviar: { c: 3, e: 3 },
    imprimir: { c: 931, e: 931, pag: 4, motivo: "total_atingido" },
    obrigatorios: 594,
    pendentes: 934,
    chegadasRestantes: 150,
    vencidos: 0,
    amanha: 336,
  },
  {
    hora: "10:00",
    minutos: 10 * 60,
    imprimir: { c: 786, e: 940, pag: 3, motivo: "janela_oculta" },
    obrigatorios: 0,
    pendentes: 0,
    chegadasRestantes: 0,
    vencidos: 0,
    amanha: 0,
  },
  {
    hora: "10:04",
    minutos: 10 * 60 + 4,
    imprimir: { c: 792, e: 792, pag: 3, motivo: "total_atingido" },
    obrigatorios: 484,
    pendentes: 792,
    chegadasRestantes: 120,
    vencidos: 3,
    amanha: 308,
  },
];

/* ---------- vigia e agenda ---------- */
export type TipoEvento = "rodada" | "falha" | "recuperacao" | "vigia";

export interface EventoDia {
  id: string;
  minutos: number;
  hora: string;
  tipo: TipoEvento;
  tom: "ok" | "wait" | "bad";
  titulo: string;
  resumo: string;
  /** o que acontece, em passos */
  detalhe: string[];
  /** como entra a automação (ligada/desligada) */
  gatilhoDesligada: string;
  gatilhoLigada: string;
  /** o que o visitante vê no popup e no banco depois */
  rastro: string;
}

export const EVENTOS_DO_DIA: EventoDia[] = [
  {
    id: "e1",
    minutos: 7 * 60 + 59,
    hora: "07:59",
    tipo: "rodada",
    tom: "ok",
    titulo: "Primeira rodada do dia",
    resumo: "Enviar 8, Imprimir 1004, completa.",
    detalhe: [
      "As duas etapas fecham no total do rodapé e gravam snapshots com status ok (rodada 20261110-0759).",
      "O motor roda em cima do que foi lido: obrigatório 640, término p50 14:40.",
      "É a primeira do dia, então congela a meta em previsao_dia. As seguintes só atualizam a previsão viva.",
    ],
    gatilhoDesligada: "Disparo: botão Coletar dados agora, no popup.",
    gatilhoLigada: "Disparo: alarme do Chrome, no horário agendado.",
    rastro: "Popup: última coleta de dados às 07:59, completa. Banco: 2 snapshots ok.",
  },
  {
    id: "e2",
    minutos: 8 * 60 + 15,
    hora: "08:15",
    tipo: "vigia",
    tom: "ok",
    titulo: "Vigia do painel",
    resumo: "Há coleta de dados hoje, sem aviso.",
    detalhe: [
      "O vigia do painel avisa quando não houve coleta de dados depois das 08:15 em dia útil.",
      "Como a rodada das 07:59 gravou, a conferência passa em silêncio.",
      "É o que impede um dia inteiro sem previsão passar despercebido: a meta do dia é congelada na primeira coleta de dados.",
    ],
    gatilhoDesligada: "Roda no painel, independe de a automação estar ligada.",
    gatilhoLigada: "Roda no painel, independe de a automação estar ligada.",
    rastro: "Sem aviso no painel.",
  },
  {
    id: "e3",
    minutos: 9 * 60,
    hora: "09:00",
    tipo: "rodada",
    tom: "ok",
    titulo: "Rodada das 09:00",
    resumo: "Enviar 3, Imprimir 931, completa.",
    detalhe: [
      "Mesma conferência por etapa. Imprimir lê 4 páginas (300, 300, 300, 31).",
      "A previsão viva é atualizada; a meta congelada às 07:59 não muda.",
    ],
    gatilhoDesligada: "Disparo: botão do popup.",
    gatilhoLigada: "Disparo: alarme.",
    rastro: "Histórico do popup: 09:00 Enviar 3 e 09:00 Imprimir 931.",
  },
  {
    id: "e4",
    minutos: 10 * 60,
    hora: "10:00",
    tipo: "falha",
    tom: "bad",
    titulo: "Janela coberta",
    resumo: "Imprimir 786 de 940, janela oculta.",
    detalhe: [
      "Alguém cobriu a janela de raspagem. O Chrome congela a renderização de uma janela oculta e a rolagem avançaria sobre linhas que nunca chegam ao DOM.",
      "O coletor para de rolar, pede o foco de volta a cada ~10 s e, sem foco em 60 s, desiste com motivo janela_oculta.",
      "Grava o parcial como incompleto. O motivo aparece no histórico mesmo que a coleta de dados seguinte dê certo.",
    ],
    gatilhoDesligada: "Disparo: botão do popup.",
    gatilhoLigada: "Disparo: alarme.",
    rastro: "Popup: COM PROBLEMA, em vermelho, e a linha de Imprimir com (janela oculta).",
  },
  {
    id: "e5",
    minutos: 10 * 60 + 4,
    hora: "10:04",
    tipo: "recuperacao",
    tom: "ok",
    titulo: "Segunda tentativa com foco",
    resumo: "Imprimir 792, completa.",
    detalhe: [
      "Com a janela visível, a rodada fecha: capturado igual ao Total do rodapé.",
      "O dado errado das 10:00 não foi apagado nem escondido: ficou gravado como incompleto, ao lado do novo.",
    ],
    gatilhoDesligada: "Disparo: botão do popup, pela liderança.",
    gatilhoLigada: "Disparo: nova rodada pela liderança (o alarme só traria a próxima da agenda).",
    rastro: "Popup: última coleta de dados às 10:04, completa.",
  },
  {
    id: "e6",
    minutos: 11 * 60 + 20,
    hora: "11:20",
    tipo: "falha",
    tom: "bad",
    titulo: "Rodada travada pelo navegador",
    resumo: "Sem progresso por 90 s, o vigia destrava.",
    detalhe: [
      "O navegador congela a janela no meio da rodada. Os pings de progresso (a cada 15 s) param de chegar.",
      "O vigia por progresso, no worker, espera 90 s sem progresso e encerra a rodada: fecha a janela e libera o botão.",
      "Se o content script ainda estiver vivo, ele desiste antes (prazo de 6 min) com o dado na mão. A ordem importa: quem desiste primeiro deixa um snapshot parcial rotulado, e não nada.",
      "Os pings não são telemetria: cada um é um evento que mantém o service worker acordado. Um timeout mais longo que a vida do worker não é um timeout.",
    ],
    gatilhoDesligada: "Disparo: botão do popup. A rodada travou do mesmo jeito.",
    gatilhoLigada: "Disparo: alarme. Sem o vigia, a rodada travada bloquearia as próximas.",
    rastro: "Popup: rodada encerrada com problema; o botão volta a funcionar.",
  },
  {
    id: "e7",
    minutos: 13 * 60 + 5,
    hora: "13:05",
    tipo: "falha",
    tom: "wait",
    titulo: "Máquina reiniciada",
    resumo: "Reinício no meio de uma rodada.",
    detalhe: [
      "O Windows reinicia durante uma rodada. O service worker morre e leva junto os timers em memória.",
      "O progresso foi carimbado em disco justamente por isso: o cenário que a limpeza conserta é o worker ter morrido.",
      "O alarme do Chrome persiste entre recarregamentos. Na carga, o worker apaga o alarme se a automação estiver desligada; se estiver ligada, só cria se ainda não existir (recriar empurraria o próximo disparo para frente).",
    ],
    gatilhoDesligada: "Na carga, o worker apaga o alarme que tenha sobrado: nada dispara sozinho.",
    gatilhoLigada: "Na carga, o worker mantém o alarme existente e só cria se faltar.",
    rastro: "Rodada interrompida, sem snapshot final.",
  },
  {
    id: "e8",
    minutos: 13 * 60 + 8,
    hora: "13:08",
    tipo: "recuperacao",
    tom: "ok",
    titulo: "Recuperação após o reinício",
    resumo: "Rodada órfã limpa após 3 min de silêncio.",
    detalhe: [
      "Depois de 3 min sem sinal, a limpeza de rodada órfã marca a rodada como interrompida pelo navegador.",
      "Antes, o botão ficava travado para sempre. Agora o popup mostra que a coleta de dados anterior foi interrompida e pode rodar de novo.",
    ],
    gatilhoDesligada: "Recuperação roda na carga do worker e a cada consulta do popup.",
    gatilhoLigada: "Recuperação roda na carga do worker; o alarme seguinte dispara normalmente.",
    rastro: "Popup: a coleta de dados anterior foi interrompida pelo navegador, pode rodar de novo.",
  },
];

/** Horários agendados (config.example.js): de hora em hora, no minuto :40, de 07:40 a 17:40. */
export const ALARMES: number[] = Array.from({ length: 11 }, (_, i) => (7 + i) * 60 + 40);
