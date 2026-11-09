/**
 * Motor de previsão (versão didática). Funções puras: sem relógio, rede ou DOM.
 * Reproduz as fórmulas do motor real (previsao.js): simulação em passos de 5 min,
 * crédito no FIM do passo, laço que inclui o passo das 17:40.
 * Todos os horários são minutos desde 00:00.
 */

export const PASSO = 5;
export const INICIO_TURNO = 7 * 60 + 40;
export const INICIO_PRODUCAO = 8 * 60 + 30;
export const FIM_TURNO = 17 * 60 + 40;
export const PISO_RITMO = 35;
export const FATOR_PESSIMISTA = 0.75;
const EPS = 0.0001;

export type Dia = "seg" | "ter" | "qua" | "qui" | "sex";

/** Fatores de projeção às 7h40 por dia da semana (calibração). Segunda é 1,000: nada pago na segunda vence na segunda. */
export const FATORES: Record<Dia, number> = { seg: 1.0, ter: 1.175, qua: 1.431, qui: 1.371, sex: 1.36 };

/** Curva de chegada da manhã: peso por hora cheia. */
export const CURVA: Record<number, number> = { 8: 13, 9: 19, 10: 22, 11: 21, 12: 20 };

export interface PontoFila {
  /** início do passo, em minutos */
  t: number;
  /** fila ao fim do passo */
  fila: number;
}

export interface Simulacao {
  /** horário de término (minutos) ou null = não fecha no turno */
  termino: number | null;
  pontos: PontoFila[];
  /** fila restante ao fim do laço */
  sobra: number;
  /** horas-pessoa de capacidade que sobraram */
  ociosasHorasPessoa: number;
}

/** Simula a fila em passos de 5 min. `chegadas(t)` devolve o que entra no passo que começa em t. */
export function simular(
  filaInicial: number,
  chegadas: (t: number) => number,
  pessoas: number,
  ritmo: number,
  inicio: number,
): Simulacao {
  const porPasso = (pessoas * ritmo * PASSO) / 60;
  let fila = filaInicial;
  let termino: number | null = null;
  let ociosas = 0;
  const pontos: PontoFila[] = [{ t: inicio, fila }];
  for (let t = inicio; t <= FIM_TURNO; t += PASSO) {
    fila += chegadas(t);
    const consumo = Math.min(fila, porPasso);
    fila -= consumo;
    if (ritmo > 0) ociosas += (porPasso - consumo) / ritmo;
    if (fila <= EPS) {
      if (termino === null) termino = t + PASSO;
    } else {
      termino = null;
    }
    pontos.push({ t: t + PASSO, fila: Math.max(0, fila) });
  }
  return { termino, pontos, sobra: Math.max(0, fila), ociosasHorasPessoa: ociosas };
}

export const semChegadas = () => 0;

export interface EntradaPrevisao {
  /** hora do relógio, em minutos */
  agora: number;
  pessoas: number;
  ritmo: number;
  /** obrigatórios: atrasados + vencem hoje */
  obrigatorios: number;
  /** pendentes que vencem depois (amanhã em diante) */
  adiantamento: number;
  dia: Dia;
  /** projetar chegadas futuras pela curva (usado na meta congelada de manhã) */
  projetar: boolean;
}

export interface Previsao {
  inicio: number;
  p50: Simulacao;
  p90: Simulacao;
  tudo: Simulacao;
  volumePrevisto: number;
  chegadasRestantes: number;
  ritmoNecessario: number;
  /** ritmo necessário antes do piso de 35/h */
  ritmoNecessarioBruto: number;
  /** o piso de 35/h está valendo */
  noPiso: boolean;
  ritmoParaZerarTudo: number;
  /** o obrigatório fecha dentro do laço do turno */
  fecha: boolean;
  /** termina depois das 17:40 (borda do último passo: 17:45 com fecha = true) */
  emRisco: boolean;
  /** distribuição das chegadas projetadas, por passo */
  chegadasPorPasso: Map<number, number>;
  chegadasIniciais: number;
}

export const round1 = (x: number) => Math.round(x * 10) / 10;

export function prever(e: EntradaPrevisao): Previsao {
  const inicio = Math.max(e.agora, INICIO_PRODUCAO);
  const pendentes = e.obrigatorios + e.adiantamento;
  const fator = FATORES[e.dia];
  const volumeDia = pendentes * fator;
  const chegadasRestantes = e.projetar ? Math.max(0, volumeDia - pendentes) : 0;

  // chegadas repartidas pela curva nas horas >= hora de agora; o que cai antes do início vira fila inicial
  const horaAgora = Math.floor(e.agora / 60);
  const horas = Object.keys(CURVA)
    .map(Number)
    .filter((h) => h >= horaAgora);
  const soma = horas.reduce((s, h) => s + CURVA[h], 0);
  const chegadasPorPasso = new Map<number, number>();
  let chegadasIniciais = 0;
  if (soma > 0 && chegadasRestantes > 0) {
    const porHora = 60 / PASSO;
    for (const h of horas) {
      const parcela = (chegadasRestantes * CURVA[h]) / soma / porHora;
      for (let k = 0; k < porHora; k++) {
        const t = h * 60 + k * PASSO;
        if (t < inicio) chegadasIniciais += parcela;
        else chegadasPorPasso.set(t, parcela);
      }
    }
  }

  const p50 = simular(e.obrigatorios, semChegadas, e.pessoas, e.ritmo, inicio);
  const p90 = simular(e.obrigatorios, semChegadas, e.pessoas, e.ritmo * FATOR_PESSIMISTA, inicio);
  const tudo = simular(pendentes + chegadasIniciais, (t) => chegadasPorPasso.get(t) ?? 0, e.pessoas, e.ritmo, inicio);

  const horasRestantes = Math.max(0.25, (FIM_TURNO - inicio) / 60);
  const ritmoNecessarioBruto = (e.obrigatorios + chegadasRestantes) / horasRestantes / e.pessoas;
  const ritmoNecessario = round1(Math.max(PISO_RITMO, ritmoNecessarioBruto));
  const ritmoParaZerarTudo = round1((pendentes + chegadasRestantes) / horasRestantes / e.pessoas);

  return {
    inicio,
    p50,
    p90,
    tudo,
    volumePrevisto: Math.round(e.projetar ? volumeDia : pendentes),
    chegadasRestantes: Math.round(chegadasRestantes),
    ritmoNecessario,
    ritmoNecessarioBruto,
    noPiso: ritmoNecessarioBruto < PISO_RITMO,
    ritmoParaZerarTudo,
    fecha: p50.termino !== null,
    emRisco: p50.termino !== null && p50.termino > FIM_TURNO,
    chegadasPorPasso,
    chegadasIniciais,
  };
}

/** "HH:MM" a partir de minutos (módulo 24 h). */
export function hhmm(min: number): string {
  const total = ((Math.round(min) % 1440) + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

export function hm(h: number, m = 0): number {
  return h * 60 + m;
}
