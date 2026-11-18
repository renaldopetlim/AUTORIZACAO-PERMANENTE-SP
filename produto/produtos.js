/*
 * Lista de produtos do catálogo.
 * Para adicionar um produto, copie um bloco { ... } e altere os dados.
 *
 * titulo     – texto da faixa superior                       (obrigatório)
 * imagem     – caminho da foto (relativo a index.html)       (obrigatório)
 * alt        – descrição da foto para leitores de tela       (opcional)
 * marca      – nome da marca OU caminho de um logo (.png, .jpg, .svg, .webp)
 *              aparece no canto superior esquerdo da foto    (opcional)
 * selo       – texto curto (ex.: "NOVO", "OFERTA") OU caminho de uma imagem de selo
 *              aparece no canto superior direito da foto     (opcional)
 * especificacoes – ficha técnica, exibida em lista abaixo da imagem (opcional):
 *   nome       – nome da característica (ex.: "Capacidade")
 *   valor      – valor (ex.: "60 litros")
 * itens      – uma linha da tabela por código (pode ter várias):
 *   codigo     – código do produto
 *   descricao  – descrição / variação (ex.: "60L")
 *   embalagem  – tipo de embalagem (ex.: "UN", "CX")
 *
 * Deixe marca, selo ou especificacoes vazios ("") ou remova a linha para não exibir.
 */
window.PRODUTOS = [
    {
        titulo: "CARR DE MÃO AÇO LARANJA",
        imagem: "carrinho-de-mao-aco-laranja-60l.png",
        alt: "Carrinho de mão de aço com caçamba laranja e pneu preto",
        marca: "",
        selo: "",
        especificacoes: [
            // { nome: "Capacidade", valor: "60 litros" },
        ],
        itens: [
            { codigo: "204941", descricao: "60L", embalagem: "UN" }
        ]
    }
];
