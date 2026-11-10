/*
 * AVALIAÇÕES DA PÁGINA
 *
 * A seção só aparece quando esta lista tiver depoimentos.
 * Use apenas depoimentos reais, com autorização por escrito de quem falou.
 *
 *   1 a 3 depoimentos: grade fixa
 *   4 ou mais: carrossel com autoplay
 *
 * Modelo (nome, tipo e depoimento são obrigatórios):
 *
 * {
 *   nome: "Nome Sobrenome",
 *   cargo: "Sócio-diretor",
 *   empresa: "Empresa",
 *   cidade_uf: "Manaus/AM",
 *   tipo: "dono",                        // "dono", "integrador" ou "parceiro"
 *   depoimento: "Até 240 caracteres.",
 *   resultado: "",                       // só com resultado comprovado
 *   foto: "assets/depoimentos/nome.webp",
 *   link_fonte: "",                      // link público da avaliação original
 *   video: "",                           // assets/depoimentos/nome.mp4
 *   destaque: false                      // true em um único depoimento
 * }
 */
window.DEPOIMENTOS = [];

/* Usado apenas na pré-visualização com ?demo=1. Nunca aparece sem esse parâmetro. */
window.DEPOIMENTOS_EXEMPLO = [
  { nome: "[PREENCHER: nome]", cargo: "[cargo]", empresa: "[empresa]", cidade_uf: "[cidade/UF]", tipo: "dono", destaque: true, depoimento: "[PREENCHER: depoimento real em destaque, com a frase mais forte do cliente sobre a leitura do TOI.]" },
  { nome: "[PREENCHER: nome]", cargo: "[cargo]", empresa: "[empresa]", cidade_uf: "[cidade/UF]", tipo: "dono", depoimento: "[PREENCHER: depoimento real de dono de usina, em até 240 caracteres.]" },
  { nome: "[PREENCHER: nome]", cargo: "[cargo]", empresa: "[empresa]", cidade_uf: "[cidade/UF]", tipo: "integrador", depoimento: "[PREENCHER: depoimento real de integrador, em até 240 caracteres.]" },
  { nome: "[PREENCHER: nome]", cargo: "[cargo]", empresa: "[empresa]", cidade_uf: "[cidade/UF]", tipo: "integrador", depoimento: "[PREENCHER: depoimento real de sócio de integradora, em até 240 caracteres.]", resultado: "[PREENCHER: resultado comprovado, se houver]" },
  { nome: "[PREENCHER: nome]", cargo: "[cargo]", empresa: "[entidade]", cidade_uf: "[cidade/UF]", tipo: "parceiro", depoimento: "[PREENCHER: depoimento real de parceiro ou entidade do setor, em até 240 caracteres.]" },
  { nome: "[PREENCHER: nome]", cargo: "[cargo]", empresa: "[entidade]", cidade_uf: "[cidade/UF]", tipo: "parceiro", depoimento: "[PREENCHER: depoimento real de parceiro ou entidade do setor, em até 240 caracteres.]" }
];
