import type { Dia } from "./model";
import { hm } from "./model";

/* ---------- Simulador: cenários do briefing (rodados no motor real) ---------- */

export interface EstadoSim {
  pessoas: number;
  ritmo: number;
  obrigatorios: number;
  adiantamento: number;
  agora: number;
  dia: Dia;
  chegadas: boolean;
}

export interface Cenario {
  id: string;
  label: string;
  descricao: string;
  estado: EstadoSim;
  /** término p50 que o motor real devolveu; null = derivado da própria fórmula */
  esperado: string | null;
}

export const CENARIOS: Cenario[] = [
  {
    id: "congelada",
    label: "Meta 07:59",
    descricao: "Terça, primeira coleta de dados do dia: 640 obrigatórios, 372 para depois, fator 1,175.",
    estado: { pessoas: 3, ritmo: 35, obrigatorios: 640, adiantamento: 372, agora: hm(7, 59), dia: "ter", chegadas: true },
    esperado: "14:40",
  },
  {
    id: "viva",
    label: "Viva 11:20",
    descricao: "Previsão recalculada às 11:20 com 265 obrigatórios, sem projeção de chegadas.",
    estado: { pessoas: 3, ritmo: 35, obrigatorios: 265, adiantamento: 326, agora: hm(11, 20), dia: "ter", chegadas: false },
    esperado: "13:55",
  },
  {
    id: "viva4",
    label: "Viva, 4 pessoas",
    descricao: "Mesmo cenário das 11:20, com mais uma pessoa na bancada.",
    estado: { pessoas: 4, ritmo: 35, obrigatorios: 265, adiantamento: 326, agora: hm(11, 20), dia: "ter", chegadas: false },
    esperado: "13:15",
  },
  {
    id: "viva5",
    label: "Viva, 5 a 40/h",
    descricao: "Cinco pessoas a 40 pedidos por hora.",
    estado: { pessoas: 5, ritmo: 40, obrigatorios: 265, adiantamento: 326, agora: hm(11, 20), dia: "ter", chegadas: false },
    esperado: "12:40",
  },
  {
    id: "leve",
    label: "Dia leve 14:00",
    descricao: "40 obrigatórios às 14:00: o ritmo necessário cairia a 3,6/h, e o piso segura em 35.",
    estado: { pessoas: 3, ritmo: 35, obrigatorios: 40, adiantamento: 410, agora: hm(14, 0), dia: "ter", chegadas: false },
    esperado: "14:25",
  },
  {
    id: "borda",
    label: "Borda 17:45",
    descricao: "965 obrigatórios com 3 pessoas a 35/h: o passo das 17:40 zera a fila e o crédito vai para 17:45.",
    estado: { pessoas: 3, ritmo: 35, obrigatorios: 965, adiantamento: 0, agora: hm(7, 59), dia: "ter", chegadas: false },
    esperado: null,
  },
];

/* ---------- Plausível e errado ---------- */

export type CategoriaCaso = "coleta" | "dados" | "calculo";

export interface Valor {
  valor: string;
  legenda: string;
  /** número comparável (para as barras) */
  num?: number;
}

export interface Caso {
  id: string;
  categoria: CategoriaCaso;
  titulo: string;
  parecia: Valor;
  certo: Valor;
  /** a comparação entre duas fontes que revelou o erro */
  fonte: string;
  como: string;
  efeito?: string;
}

export const CATEGORIAS: { value: "all" | CategoriaCaso; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "coleta", label: "Coleta de dados" },
  { value: "dados", label: "Dados" },
  { value: "calculo", label: "Cálculo" },
];

export const CASOS: Caso[] = [
  {
    id: "tela",
    categoria: "coleta",
    titulo: "Tela errada",
    parecia: { valor: "6", legenda: "pedidos lidos", num: 6 },
    certo: { valor: "1.250", legenda: "pedidos no dia", num: 1250 },
    fonte: "leitura do coletor contra o volume do dia",
    como: "Raspar a tela errada devolve um número pequeno, bem formatado, sem erro algum. Só a comparação com o tamanho conhecido do dia mostra que 6 não pode ser a fila.",
  },
  {
    id: "subaba",
    categoria: "coleta",
    titulo: "Sub-aba errada",
    parecia: { valor: "567", legenda: "pedidos da sub-aba padrão", num: 567 },
    certo: { valor: "852", legenda: "pedidos da etapa inteira", num: 852 },
    fonte: "sub-aba padrão contra a sub-aba \"Todos\" da mesma etapa",
    como: "O total do rodapé confirmava a metade lida, então o capturado batia com o esperado. A etapa inteira só aparece na sub-aba \"Todos\"; hoje o coletor aborta se não consegue selecioná-la.",
  },
  {
    id: "oculta",
    categoria: "coleta",
    titulo: "Aba em segundo plano",
    parecia: { valor: "69", legenda: "pedidos capturados", num: 69 },
    certo: { valor: "258", legenda: "pedidos esperados", num: 258 },
    fonte: "capturado contra o total esperado do rodapé",
    como: "Com a janela oculta a lista não renderiza. O coletor para de rolar, pede foco e, se esgotar 60 s, grava o snapshot como incompleto com o motivo janela_oculta, em vez de entregar 69 como se fosse tudo.",
  },
  {
    id: "coberta",
    categoria: "coleta",
    titulo: "Janela apenas coberta",
    parecia: { valor: "106", legenda: "pedidos capturados", num: 106 },
    certo: { valor: "190", legenda: "pedidos esperados", num: 190 },
    fonte: "comparação entre o que estava visível e o que estava coberto",
    como: "Dois dias de teoria sobre a lista que \"se reseta\" foram resolvidos numa tarde com dois scripts de diagnóstico. A hipótese refutada ficou documentada junto da medição.",
  },
  {
    id: "chave",
    categoria: "dados",
    titulo: "Cruzar por uma chave só",
    parecia: { valor: "46", legenda: "bipagens que casaram", num: 46 },
    certo: { valor: "102", legenda: "bipagens no total", num: 102 },
    fonte: "bipagens contra a fila, por rastreio e por nº do pedido",
    como: "Com uma chave só, de 102 bipagens apenas 46 casavam, e o erro crescia ao longo do dia. A chave dupla (rastreio e nº do pedido) fecha 102 de 102.",
    efeito: "Fila cerca de 10% inflada.",
  },
  {
    id: "teto",
    categoria: "dados",
    titulo: "Teto de 1.000 linhas",
    parecia: { valor: "1.000", legenda: "linhas lidas", num: 1000 },
    certo: { valor: "1.160", legenda: "pedidos capturados", num: 1160 },
    fonte: "count(fila_do_dia) contra a soma de total_capturado da mesma rodada",
    como: "O PostgREST corta em 1.000 linhas sem avisar. A coleta de dados tinha capturado 1.160 de 1.160 e o banco estava certo; quem truncava era o SELECT. Resultado de exatamente 1.000 linhas é suspeito, nunca resultado.",
    efeito: "Obrigatórios congelados em 981 em vez de 1.088; ritmo necessário 41,5/h em vez de 39,6/h; 160 chegadas futuras inventadas.",
  },
  {
    id: "ritmo",
    categoria: "calculo",
    titulo: "Dois ritmos com o mesmo nome",
    parecia: { valor: "48,9/h", legenda: "ritmo na aba Previsão" },
    certo: { valor: "39,2/h", legenda: "ritmo na Visão Geral, no mesmo instante" },
    fonte: "duas telas do mesmo painel, no mesmo instante",
    como: "O início da contagem (login ou primeiro bipe) e a agregação (média simples ou total dividido por tempo e pessoas) divergiam. A Previsão passou a replicar a fórmula da Visão Geral: dois números com o mesmo nome destroem a confiança nos dois.",
  },
  {
    id: "fila",
    categoria: "calculo",
    titulo: "Avaliar a fila inteira",
    parecia: { valor: "não fecha", legenda: "sobram 215, ritmo necessário 80,6/h" },
    certo: { valor: "fecha", legenda: "só 6 dos 387 pendentes vencem hoje" },
    fonte: "obrigatório (vence hoje) contra a fila inteira",
    como: "Às 16h03, 373 dos 387 pendentes eram adiantamento da terça. A capacidade passou a ser avaliada sobre o obrigatório, e as chegadas ficam fora da simulação dele.",
  },
  {
    id: "almoco",
    categoria: "calculo",
    titulo: "Almoço descontado duas vezes",
    parecia: { valor: "15h15", legenda: "término com parada das 13h às 14h" },
    certo: { valor: "14h15", legenda: "término sem parada (700 pedidos, 3 pessoas a 35/h)" },
    fonte: "teste do motor: a dupla contagem do almoço",
    como: "O ritmo real já contém almoço e pausas; parar a simulação das 13h às 14h inflava a previsão em uma hora inteira. O padrão é ritmo_inclui_pausas, escrito como !== false para que uma configuração sem a coluna não caia na dupla contagem.",
  },
];

/* ---------- Uma função, três lugares ---------- */

export type NoId = "fonte" | "coletor" | "painel";

export interface ArquivoCopia {
  nome: string;
  estado: string;
}

export interface No {
  id: NoId;
  titulo: string;
  caminho: string;
  papel: string;
  difere: string;
  verificacao: string;
  arquivos: ArquivoCopia[];
  /** hash do arquivo inteiro (valores ilustrativos) */
  hashArquivo: string;
  /** hash do código sem comentários (valores ilustrativos) */
  hashLogica: string;
}

export const HASH_DRIFT = { arquivo: "c40d9e17", logica: "91ab33f0" };

export const NOS: No[] = [
  {
    id: "fonte",
    titulo: "Fonte",
    caminho: "previsao-expedicao/motor/previsao.js",
    papel: "Único lugar onde o motor é editado. Função pura: o instante entra por parâmetro, sem DOM, fetch, Supabase nem relógio implícito.",
    difere: "Nada: é a referência. Pendência documentada: a conversão do instante usa o relógio do navegador, então o motor só vale com o navegador em São Paulo.",
    verificacao: "17 verificações do motor e 96 do parser rodam em memória, porque não há efeito colateral para isolar.",
    arquivos: [
      { nome: "previsao.js", estado: "fonte" },
      { nome: "parser.js", estado: "fonte" },
      { nome: "prazo.js", estado: "fonte" },
    ],
    hashArquivo: "a3f9c21d",
    hashLogica: "5e07b8d2",
  },
  {
    id: "coletor",
    titulo: "Coletor",
    caminho: "coletor-fila/previsao.js",
    papel: "Congela a meta do dia na primeira coleta de dados e depois só atualiza a previsão viva.",
    difere: "Nada. Os três arquivos são byte a byte idênticos aos da fonte.",
    verificacao: "Comparação por hash de cada arquivo contra a fonte, conferida em 08/11/2026. Como não há build step, a distribuição é por cópia de arquivo.",
    arquivos: [
      { nome: "previsao.js", estado: "idêntico" },
      { nome: "parser.js", estado: "idêntico" },
      { nome: "prazo.js", estado: "idêntico" },
    ],
    hashArquivo: "a3f9c21d",
    hashLogica: "5e07b8d2",
  },
  {
    id: "painel",
    titulo: "Painel (Hope SaaS)",
    caminho: "hope-saas, cópia do motor",
    papel: "Recalcula a previsão viva o dia todo e mostra a divergência entre a meta congelada e a viva.",
    difere: "A lógica é idêntica. Diferem só o cabeçalho de aviso \"CÓPIA SEM EDIÇÃO\" e um comentário.",
    verificacao: "Compara-se o código sem comentários. Se fossem dois códigos, o alerta de divergência dispararia por bug em vez de por realidade operacional.",
    arquivos: [{ nome: "previsao.js", estado: "lógica idêntica" }],
    hashArquivo: "7be104a9",
    hashLogica: "5e07b8d2",
  },
];

export const PUREZA = ["sem relógio implícito", "sem rede", "sem DOM", "sem Supabase"];

/* ---------- Calibração ---------- */

export interface DiaFator {
  dia: Dia;
  label: string;
  fator: number;
  desvio: string;
  volume: string;
  nota: string;
}

export const DIAS: DiaFator[] = [
  {
    dia: "seg",
    label: "Seg",
    fator: 1.0,
    desvio: "0,000 (3 de 3 segundas)",
    volume: "~906 pedidos",
    nota: "Às 7h40 de segunda 100% da carga obrigatória já está visível: nada pago na segunda vence na segunda.",
  },
  {
    dia: "ter",
    label: "Ter",
    fator: 1.175,
    desvio: "não detalhado por dia",
    volume: "~1.348 pedidos",
    nota: "Dia crítico: recebe o acúmulo de domingo e segunda. Com a capacidade padrão (~1.125 pedidos) a terça não fecha.",
  },
  {
    dia: "qua",
    label: "Qua",
    fator: 1.431,
    desvio: "1% a 4,6% (quarta a sexta)",
    volume: "~650 pedidos",
    nota: "Base menor e fator maior: o dia tem metade do volume da terça.",
  },
  {
    dia: "qui",
    label: "Qui",
    fator: 1.371,
    desvio: "1% a 4,6% (quarta a sexta)",
    volume: "~650 pedidos",
    nota: "Mesmo perfil de quarta: base menor, fator maior.",
  },
  {
    dia: "sex",
    label: "Sex",
    fator: 1.36,
    desvio: "1% a 4,6% (quarta a sexta)",
    volume: "~650 pedidos",
    nota: "Mesmo perfil de quarta e quinta.",
  },
];

export const FATOR_GLOBAL = { valor: 1.274, cv: "12,8%" };
