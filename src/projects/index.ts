/**
 * Lista de projetos exibidos no site. Para adicionar/remover um projeto, mexa só aqui:
 * uma linha de import e uma entrada no array. Tudo mais vive em src/projects/<id>/.
 * A ordem na página vem de `order` (cada projeto), não da posição neste array.
 */
import type { Project } from "./types";
import hopeSaas from "./hope-saas";
import bancada from "./bancada";
import coletor from "./coletor";
import previsao from "./previsao";
// Exemplo mínimo do contrato (2 telas). Compila sempre; descomente a linha abaixo e a entrada no array para exibir.
// import exemplo from "./_exemplo";

export const projects: Project[] = [
  hopeSaas,
  bancada,
  coletor,
  previsao,
  // exemplo,
];
