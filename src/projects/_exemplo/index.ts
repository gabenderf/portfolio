/* Projeto de exemplo — prova o contrato (2 telas, master-detail com filtro, ação simulada, go()).
   Fora do array exportado por padrão (ver ../index.ts). Copie esta pasta como ponto de partida. */
import type { Project } from "../types";
import { ListaScreen } from "./ListaScreen";
import { PainelScreen } from "./PainelScreen";
import "./styles.css";

const project: Project = {
  id: "_exemplo",
  order: 99,
  layout: "feature",
  kicker: "99 · Exemplo",
  title: "Projeto de exemplo",
  lead: "Prova o contrato: duas telas, filtro como estado, master-detail e ação simulada.",
  context: ["Esta pasta existe só para validar o contrato.", "Use-a como referência mínima."],
  concepts: [{ title: "Telas", text: "Cada tela é um componente React que recebe ScreenProps." }],
  stack: ["React", "TypeScript"],
  metrics: [{ label: "Telas", value: "2", sub: "lista e painel" }],
  arch: ["O index.ts exporta um Project.", "O site monta cards e visor a partir dele."],
  repo: null,
  screens: [
    { id: "lista", label: "Lista", url: "exemplo.app/lista", hint: "Clique nas linhas", Component: ListaScreen },
    { id: "painel", label: "Painel", url: "exemplo.app/painel", hint: "Resumo", Component: PainelScreen },
  ],
};

export default project;
