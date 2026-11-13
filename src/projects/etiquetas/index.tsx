/* Gerador de etiquetas B2B (etiquetas-nf). A tela é o próprio sistema (public/demo/etiquetas),
   com dados fictícios e sem banco: o cadastro de clientes fica só no navegador. */
import type { Project } from "../types";
import { LiveDemo } from "../../work/LiveDemo";

const SRC = `${import.meta.env.BASE_URL}demo/etiquetas/index.html`;

function Gerador() {
  return <LiveDemo src={SRC} title="Gerador de etiquetas B2B" desktopWidth={1200} />;
}

const project: Project = {
  id: "etiquetas",
  order: 5,
  layout: "feature",
  kicker: "05 · Expedição B2B",
  title: "Gerador de etiquetas B2B",
  lead: "Cria as etiquetas de todos os volumes de um pedido B2B a partir da nota fiscal, prontas para imprimir.",
  story: {
    before: "Os pedidos B2B precisam sair com cada volume identificado, e montar isso à mão era lento e sujeito a erro.",
    after:
      "Você carrega a nota fiscal (XML ou PDF) e o gerador preenche os dados sozinho e cria todas as etiquetas, com logo, dados do cliente, nota, numeração do volume (01/40, 02/40…), lote e validade.",
    result: "Rastreabilidade de lote e validade em cada volume, o que é essencial para quem distribui produto cirúrgico.",
  },
  context: [
    "Pedido B2B sai em vários volumes, e cada um precisa ir identificado: para quem vai, de qual nota é, qual volume da sequência e de qual lote. Montar isso à mão, volume por volume, era lento e deixava espaço para erro.",
    "O gerador lê a própria nota fiscal, no XML da NF-e ou no PDF da DANFE, e preenche destinatário, CNPJ, endereço, número da nota e quantidade de volumes. Depois gera uma etiqueta por volume, pronta para a impressora térmica.",
    "O que você vê ao lado é o sistema de verdade, em modo demonstração: já abre com uma nota de exemplo fictícia, e o cadastro de clientes fica só no seu navegador. Dá para trocar a quantidade de volumes, o tamanho da etiqueta ou carregar o XML de uma nota.",
  ],
  concepts: [
    {
      title: "Lê a NF em dois formatos",
      text: "No XML, os campos vêm direto da estrutura da NF-e. No PDF, o texto é localizado pela posição na página, com regras de recuperação para quando o leiaute da DANFE varia.",
    },
    {
      title: "Numeração sem pular volume",
      text: "As etiquetas saem em sequência (01/40, 02/40…) a partir da quantidade de volumes da nota. Ninguém digita volume por volume.",
    },
    {
      title: "Funciona sem conexão",
      text: "O cadastro de clientes fica no Supabase e é espelhado no navegador, com busca por nome, CNPJ ou cidade. Se a conexão cair, a expedição continua imprimindo.",
    },
    {
      title: "Texto que cabe na etiqueta",
      text: "A fonte se ajusta ao tamanho escolhido, de 60 x 30 mm a 100 x 150 mm, para nenhum dado ser cortado na impressão.",
    },
  ],
  stack: ["JavaScript", "HTML e CSS", "pdf.js", "NF-e (XML)", "Supabase"],
  metrics: [
    { label: "Formatos de NF", value: "2", sub: "XML da NF-e e PDF da DANFE" },
    { label: "Tamanhos de etiqueta", value: "5", sub: "de 60 x 30 a 100 x 150 mm" },
  ],
  arch: [
    "A nota entra como arquivo XML ou PDF e vira os dados do destinatário e da NF.",
    "Lote, fabricação e validade são preenchidos ou gerados na própria tela.",
    "Uma etiqueta é montada por volume, com a numeração da sequência.",
    "A impressão sai no tamanho da etiqueta térmica escolhida.",
  ],
  repo: "https://github.com/gabenderf/etiquetas-nf-demo",
  demoUrl: SRC,
  screens: [
    { id: "gerador", label: "Gerador", url: "etiquetas / nota fiscal", hint: "Sistema real · dados fictícios", Component: Gerador },
  ],
};

export default project;
