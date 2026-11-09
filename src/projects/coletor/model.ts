/**
 * Lógica pura do Coletor da fila (sem React, sem relógio, sem DOM).
 * Regras: docs/conteudo-projetos.md, seções 4.4 e 4.7 (raspagem) e 5.5 (motor de previsão).
 */

/* ------------------------------------------------------------------ */
/* Parâmetros do coletor (4.4, 4.5, 4.7)                               */
/* ------------------------------------------------------------------ */
export const PARAMS = {
  PASSO_FRACAO: 0.6,
  PAUSA_MS: 300,
  POR_PAGINA: 300,
  TOLERANCIA_CHEGADAS: 3,
  MAX_PASSOS: 600,
  MAX_PAGINAS: 12,
  LEITURAS_SEM_NOVIDADE: 6,
  /** pedidos novos por passo (medido: 2,3). */
  RENDIMENTO: 2.3,
  /** linhas que existem no DOM por vez (rolagem virtual). */
  JANELA_LINHAS: 8,
  /** janela coberta: o foco é pedido a cada ~10 s e a rodada desiste em 60 s. */
  FOCO_CADA_S: 10,
  FOCO_LIMITE_S: 60,
} as const;

export type Status = "ok" | "incompleto" | "erro";
export type EtapaId = "para_enviar" | "para_imprimir";
export type Motivo =
  | "total_atingido"
  | "fim_da_lista"
  | "janela_oculta"
  | "sub_aba_nao_encontrada"
  | "sessao_expirada";

export const ETAPA_ROTULO: Record<EtapaId, string> = {
  para_enviar: "Para Enviar",
  para_imprimir: "Para Imprimir",
};

export const MOTIVO_ROTULO: Record<Motivo, string> = {
  total_atingido: "total atingido",
  fim_da_lista: "fim da lista",
  janela_oculta: "janela oculta",
  sub_aba_nao_encontrada: "sub-aba não encontrada",
  sessao_expirada: "sessão expirada",
};

/** Aritmética de parada por página (parser.js, esperadoNaPagina). */
export function esperadoNaPagina(
  pagina: number,
  totalPaginas: number,
  total: number,
  porPagina: number | null,
): number | null {
  if (porPagina == null) return null;
  if (pagina >= totalPaginas) return total - (totalPaginas - 1) * porPagina;
  return Math.min(porPagina, total);
}

/** A tolerância de chegadas só entra aqui, no "completo" final (nunca na parada de cada página). */
export function statusDaEtapa(capturado: number, esperado: number | null): "ok" | "incompleto" {
  if (esperado === null) return "incompleto";
  if (esperado === 0) return "ok";
  return capturado >= esperado - PARAMS.TOLERANCIA_CHEGADAS ? "ok" : "incompleto";
}

/* ------------------------------------------------------------------ */
/* Simulação da rodada, quadro a quadro                                */
/* ------------------------------------------------------------------ */
export interface Falhas {
  janelaCoberta: boolean;
  subAbaErrada: boolean;
  listaNaoTermina: boolean;
  pedidosSaindo: boolean;
  sessaoExpirada: boolean;
  /** pedidos que entram na fila enquanto a coleta de dados roda */
  chegadas: 0 | 3 | 4;
}

export const SEM_FALHAS: Falhas = {
  janelaCoberta: false,
  subAbaErrada: false,
  listaNaoTermina: false,
  pedidosSaindo: false,
  sessaoExpirada: false,
  chegadas: 0,
};

export const TOTAL_ENVIAR = 8;
export const TOTAL_IMPRIMIR = 1004;
/** Sub-aba padrão de Para Imprimir: o rodapé mostra 567, a fila real tem 852. */
export const SUBABA_PADRAO = { rodape: 567, real: 852 };

export interface Snapshot {
  etapa: EtapaId;
  subAba: string;
  status: Status;
  capturado: number;
  esperado: number | null;
  paginas: number;
  motivo: Motivo;
  passos: number;
  /** pedidos que a conferência não enxerga (só a simulação sabe) */
  perdidos: number;
}

export interface LinhaJanela {
  /** posição do pedido dentro da etapa (0 = primeiro) */
  pos: number;
  novo: boolean;
}

export interface Quadro {
  etapa: EtapaId;
  subAba: string;
  pagina: number;
  totalPaginas: number;
  total: number | null;
  capturado: number;
  capturadoPagina: number;
  alvoPagina: number | null;
  novas: number;
  linhas: LinhaJanela[];
  oculta: boolean;
  passo: number;
  evento: string;
  tom: "" | "ok" | "wait" | "bad";
  /** preenchido no último quadro de cada etapa */
  fim?: Snapshot;
}

export interface Rodada {
  quadros: Quadro[];
  snapshots: Snapshot[];
  perdidos: number;
}

function janela(captPag: number, base: number, novas: number): LinhaJanela[] {
  const ini = Math.max(0, captPag - PARAMS.JANELA_LINHAS);
  const out: LinhaJanela[] = [];
  for (let i = ini; i < captPag; i++) out.push({ pos: base + i, novo: i >= captPag - novas });
  return out;
}

interface OpcoesEtapa {
  etapa: EtapaId;
  subAba: string;
  totalInicial: number;
  falhas: Falhas;
  /** só a segunda etapa sofre as falhas de lista */
  sujeitaAFalhas: boolean;
}

function rasparEtapa(op: OpcoesEtapa, out: Quadro[]): Snapshot {
  const { etapa, falhas } = op;
  const f = op.sujeitaAFalhas ? falhas : SEM_FALHAS;
  let total = op.totalInicial;
  let pagina = 1;
  let capt = 0;
  let captPag = 0;
  let acc = 0;
  let passo = 0;
  let perdidos = 0;
  const nPaginas = () => Math.max(1, Math.ceil(total / PARAMS.POR_PAGINA));
  const alvoAtual = () => esperadoNaPagina(pagina, nPaginas(), total, PARAMS.POR_PAGINA);

  const quadro = (evento: string, tom: Quadro["tom"] = "", extra: Partial<Quadro> = {}): Quadro => ({
    etapa,
    subAba: op.subAba,
    pagina,
    totalPaginas: nPaginas(),
    total,
    capturado: capt,
    capturadoPagina: captPag,
    alvoPagina: alvoAtual(),
    novas: 0,
    linhas: janela(captPag, (pagina - 1) * PARAMS.POR_PAGINA, 0),
    oculta: false,
    passo,
    evento,
    tom,
    ...extra,
  });
  const push = (evento: string, tom: Quadro["tom"] = "", extra: Partial<Quadro> = {}) => {
    out.push(quadro(evento, tom, extra));
  };

  const fechar = (motivo: Motivo, status: Status, esperado: number | null): Snapshot => {
    const snap: Snapshot = {
      etapa,
      subAba: op.subAba,
      status,
      capturado: capt,
      esperado,
      paginas: pagina,
      motivo,
      passos: passo,
      perdidos,
    };
    out[out.length - 1].fim = snap;
    return snap;
  };

  if (falhas.sessaoExpirada && etapa === "para_enviar") {
    push("Abrindo a tela de fila...");
    push("Sessão do UpSeller expirada: falha explícita, nunca um snapshot de 0 pedidos.", "bad", {
      total: null,
      alvoPagina: null,
      linhas: [],
    });
    return fechar("sessao_expirada", "erro", null);
  }

  if (etapa === "para_imprimir" && f.subAbaErrada) {
    const comum: Partial<Quadro> = {
      subAba: "Etiqueta não impressa",
      total: SUBABA_PADRAO.rodape,
      totalPaginas: 2,
      alvoPagina: null,
      linhas: [],
    };
    push('A tela abriu na sub-aba padrão (Etiqueta não impressa). Procurando "Todos"...', "wait", comum);
    push('"Todos" não encontrada: o coletor aborta em vez de ler a sub-aba padrão.', "bad", comum);
    return fechar("sub_aba_nao_encontrada", "erro", null);
  }

  push(`Sub-aba "${op.subAba}" selecionada. Total do rodapé: ${total}.`);

  let removidasNaPagina = 0;
  let limites: number[] = [];
  let paginaDosLimites = 0;

  while (passo < PARAMS.MAX_PASSOS) {
    // janela coberta: a rolagem para, pede foco a cada ~10 s e desiste em 60 s
    if (f.janelaCoberta && capt >= 120) {
      push("Janela coberta (visibilityState = hidden): a rolagem para em vez de raspar errado.", "bad", { oculta: true });
      for (let s = PARAMS.FOCO_CADA_S; s <= PARAMS.FOCO_LIMITE_S; s += PARAMS.FOCO_CADA_S) {
        passo++;
        push(`Pedindo o foco de volta (${s} s de ${PARAMS.FOCO_LIMITE_S} s)...`, "wait", { oculta: true });
      }
      push("Sem foco em 60 s: desiste com o dado na mão.", "bad", { oculta: true });
      return fechar("janela_oculta", statusDaEtapa(capt, total), total);
    }
    // lista que para de entregar linhas: 6 leituras seguidas sem pedido novo
    if (f.listaNaoTermina && capt >= 700) {
      for (let s = 1; s <= PARAMS.LEITURAS_SEM_NOVIDADE; s++) {
        passo++;
        push(`Leitura sem pedido novo (${s}/${PARAMS.LEITURAS_SEM_NOVIDADE}).`, "wait");
      }
      push("6 leituras seguidas sem novidade: a lista não termina, grava o parcial.", "bad");
      return fechar("fim_da_lista", statusDaEtapa(capt, total), total);
    }

    passo++;
    const alvo = alvoAtual() ?? 0;
    acc += PARAMS.RENDIMENTO;
    let novas = Math.floor(acc);
    acc -= novas;
    novas = Math.min(novas, alvo - captPag);
    captPag += novas;
    capt += novas;

    let evento = `Rolou ${String(PARAMS.PASSO_FRACAO).replace(".", ",")} da altura, esperou ${PARAMS.PAUSA_MS} ms: +${novas} novas.`;
    let tom: Quadro["tom"] = "";
    if (f.pedidosSaindo && pagina <= 3) {
      if (paginaDosLimites !== pagina) {
        paginaDosLimites = pagina;
        removidasNaPagina = 0;
        limites = [];
        for (let k = 1; k <= 8; k++) limites.push(Math.round((alvo * k) / 9));
      }
      while (removidasNaPagina < limites.length && captPag >= limites[removidasNaPagina]) {
        total--;
        perdidos++;
        removidasNaPagina++;
        evento = "Um pedido já lido saiu da lista: os seguintes deslizam e um deles não será lido.";
        tom = "wait";
      }
    }
    push(evento, tom, { novas, linhas: janela(captPag, (pagina - 1) * PARAMS.POR_PAGINA, novas) });

    if (captPag >= alvo) {
      if (pagina >= nPaginas()) {
        push(`Página ${pagina}/${nPaginas()} completa. Total atingido: ${capt}.`, "ok");
        if (falhas.chegadas > 0 && op.sujeitaAFalhas) {
          total += falhas.chegadas;
          push(`Chegaram ${falhas.chegadas} pedidos durante a leitura. Total do rodapé: ${total}.`, "wait");
        }
        return fechar("total_atingido", statusDaEtapa(capt, total), total);
      }
      push(`Página ${pagina} completa (${captPag}/${alvo}). Próxima página.`, "ok");
      pagina++;
      captPag = 0;
      acc = 0;
      push(`Página ${pagina}/${nPaginas()}: ${alvoAtual()} linhas esperadas.`);
    }
  }
  push("MAX_PASSOS esgotado.", "bad");
  return fechar("fim_da_lista", statusDaEtapa(capt, total), total);
}

/** Roda a rodada inteira (Para Enviar, depois Para Imprimir) e devolve todos os quadros. */
export function simularRodada(falhas: Falhas): Rodada {
  const quadros: Quadro[] = [];
  const snapshots: Snapshot[] = [];
  const s1 = rasparEtapa(
    { etapa: "para_enviar", subAba: "Todos", totalInicial: TOTAL_ENVIAR, falhas, sujeitaAFalhas: false },
    quadros,
  );
  snapshots.push(s1);
  if (s1.status !== "erro") {
    snapshots.push(
      rasparEtapa(
        { etapa: "para_imprimir", subAba: "Todos", totalInicial: TOTAL_IMPRIMIR, falhas, sujeitaAFalhas: true },
        quadros,
      ),
    );
  }
  const perdidos = snapshots.reduce((a, s) => a + s.perdidos, 0);
  return { quadros, snapshots, perdidos };
}

/** Texto curto: o que o resultado significa. */
export function explicarSnapshot(s: Snapshot, falhas: Falhas): string {
  const e = s.esperado;
  if (s.motivo === "sessao_expirada")
    return "Sessão expirada é falha explícita: status erro, e nenhum snapshot de 0 pedidos entra como se fosse uma coleta de dados válida.";
  if (s.motivo === "sub_aba_nao_encontrada")
    return `Sem a verificação, o rodapé mostraria ${SUBABA_PADRAO.rodape} e o capturado bateria com ${SUBABA_PADRAO.rodape}: o snapshot passaria como ok com ${SUBABA_PADRAO.real - SUBABA_PADRAO.rodape} pedidos a menos (${SUBABA_PADRAO.real} reais). O coletor aborta e grava erro.`;
  if (s.motivo === "janela_oculta")
    return `Janela coberta: ${s.capturado} de ${e ?? "?"}. A rolagem parou, pediu foco por 60 s e gravou o parcial como incompleto, com o motivo.`;
  if (s.motivo === "fim_da_lista")
    return `A lista parou de entregar linhas em ${s.capturado} de ${e ?? "?"}: 6 leituras sem pedido novo. Gravado como incompleto, nunca como ok.`;
  if (s.perdidos > 0)
    return `Capturado ${s.capturado} e Total ${e}: a conferência passa. Mesmo assim ${s.perdidos} pedidos nunca foram lidos, porque a paginação é posicional e a conferência é cega a isso.`;
  if (falhas.chegadas > 0 && s.etapa === "para_imprimir") {
    const dif = (e ?? 0) - s.capturado;
    return s.status === "ok"
      ? `Faltaram ${dif} de ${e}: dentro da tolerância de ${PARAMS.TOLERANCIA_CHEGADAS}, então vale como completo. A tolerância não afrouxa a parada de cada página.`
      : `Faltaram ${dif} de ${e}: acima da tolerância de ${PARAMS.TOLERANCIA_CHEGADAS}, gravado como incompleto.`;
  }
  return `Capturado igual ao Total do rodapé (${s.capturado}), parada por total atingido.`;
}

/* ------------------------------------------------------------------ */
/* Motor de previsão (5.5): função pura, a mesma lógica do painel      */
/* ------------------------------------------------------------------ */
export const TURNO = {
  PASSO: 5,
  INICIO_PRODUCAO: 8 * 60 + 30,
  FIM: 17 * 60 + 40,
  PISO_RITMO: 35,
  FATOR_P90: 0.75,
} as const;

/** Simula de `inicio` até o fim do turno, sem chegadas. Devolve o minuto de término ou null. */
export function simularTermino(fila: number, pessoas: number, ritmo: number, agora: number): number | null {
  const inicio = Math.max(agora, TURNO.INICIO_PRODUCAO);
  const porPasso = (pessoas * ritmo * TURNO.PASSO) / 60;
  let f = fila;
  let termino: number | null = null;
  for (let t = inicio; t <= TURNO.FIM; t += TURNO.PASSO) {
    f -= Math.min(f, porPasso);
    if (f <= 0.0001) {
      if (termino === null) termino = t + TURNO.PASSO;
    } else termino = null;
  }
  return termino;
}

/** Curva de chegada da manhã: peso por hora cheia (5.5). */
const CURVA: Record<number, number> = { 8: 13, 9: 19, 10: 22, 11: 21, 12: 20 };

/** termino_tudo_p50: pendentes mais chegadas projetadas pela curva; o que cai antes da produção vira fila inicial. */
function terminoTudo(e: EntradaPrevisao): number | null {
  const inicio = Math.max(e.agora, TURNO.INICIO_PRODUCAO);
  const horaAgora = Math.floor(e.agora / 60);
  const horas = Object.keys(CURVA).map(Number).filter((h) => h >= horaAgora);
  const soma = horas.reduce((a, h) => a + CURVA[h], 0);
  const porPasso = new Map<number, number>();
  let iniciais = 0;
  if (soma > 0 && e.chegadasRestantes > 0) {
    const porHora = 60 / TURNO.PASSO;
    for (const h of horas) {
      const parcela = (e.chegadasRestantes * CURVA[h]) / soma / porHora;
      for (let k = 0; k < porHora; k++) {
        const t = h * 60 + k * TURNO.PASSO;
        if (t < inicio) iniciais += parcela;
        else porPasso.set(t, parcela);
      }
    }
  }
  const cap = (e.pessoas * e.ritmo * TURNO.PASSO) / 60;
  let fila = e.pendentes + iniciais;
  let termino: number | null = null;
  for (let t = inicio; t <= TURNO.FIM; t += TURNO.PASSO) {
    fila += porPasso.get(t) ?? 0;
    fila -= Math.min(fila, cap);
    if (fila <= 0.0001) {
      if (termino === null) termino = t + TURNO.PASSO;
    } else termino = null;
  }
  return termino;
}

function capacidade(pessoas: number, ritmo: number, agora: number): number {
  const inicio = Math.max(agora, TURNO.INICIO_PRODUCAO);
  const porPasso = (pessoas * ritmo * TURNO.PASSO) / 60;
  let n = 0;
  for (let t = inicio; t <= TURNO.FIM; t += TURNO.PASSO) n++;
  return n * porPasso;
}

export interface EntradaPrevisao {
  obrigatorios: number;
  pendentes: number;
  chegadasRestantes: number;
  pessoas: number;
  ritmo: number;
  /** minutos desde 00:00 */
  agora: number;
}

export interface Previsao {
  p50: number | null;
  p90: number | null;
  ritmoNecessario: number;
  ritmoZerarTudo: number;
  falta: boolean;
  sobram: number;
  ociosasHorasPessoa: number;
  /** termino_tudo_p50 (null = não fecha no turno) */
  tudo: number | null;
}

export function calcularPrevisao(e: EntradaPrevisao): Previsao {
  const p50 = simularTermino(e.obrigatorios, e.pessoas, e.ritmo, e.agora);
  const p90 = simularTermino(e.obrigatorios, e.pessoas, e.ritmo * TURNO.FATOR_P90, e.agora);
  const inicio = Math.max(e.agora, TURNO.INICIO_PRODUCAO);
  const horas = Math.max(0.25, (TURNO.FIM - inicio) / 60);
  const nec = Math.max(TURNO.PISO_RITMO, (e.obrigatorios + e.chegadasRestantes) / horas / e.pessoas);
  const zerar = (e.pendentes + e.chegadasRestantes) / horas / e.pessoas;
  const cap = capacidade(e.pessoas, e.ritmo, e.agora);
  return {
    p50,
    p90,
    ritmoNecessario: Math.round(nec * 10) / 10,
    ritmoZerarTudo: Math.round(zerar * 10) / 10,
    falta: p50 === null,
    sobram: p50 === null ? Math.ceil(e.obrigatorios - cap) : 0,
    ociosasHorasPessoa: p50 === null ? 0 : Math.round(((cap - e.obrigatorios) / e.ritmo) * 10) / 10,
    tudo: terminoTudo(e),
  };
}
