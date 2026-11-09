export type Estado = "ok" | "wait" | "bad";

export interface Pedido {
  id: string;
  nome: string;
  status: Estado;
  valor: number;
  desc: string;
}

export const PEDIDOS: Pedido[] = [
  { id: "a1", nome: "Pedido 1042", status: "ok", valor: 1280.5, desc: "Conferido e liberado para expedição." },
  { id: "a2", nome: "Pedido 1043", status: "wait", valor: 342, desc: "Aguardando conferência do segundo operador." },
  { id: "a3", nome: "Pedido 1044", status: "bad", valor: 99.9, desc: "Recusado: endereço fora da área atendida." },
];

export const ROTULO: Record<Estado, string> = { ok: "Liberado", wait: "Em análise", bad: "Recusado" };
