/*
 * Lista de produtos do catálogo.
 * Para adicionar um produto, copie um bloco { ... } e altere os dados.
 *
 * titulo   – texto da faixa superior
 * imagem   – caminho da foto (relativo a index.html)
 * alt      – descrição da foto para leitores de tela
 * itens    – uma linha da tabela por código (pode ter várias)
 *
 * Exemplo com várias linhas:
 *   itens: [
 *     { codigo: "000001", descricao: "60L", embalagem: "UN" },
 *     { codigo: "000002", descricao: "80L", embalagem: "UN" }
 *   ]
 */
window.PRODUTOS = [
    {
        titulo: "CARR DE MÃO AÇO LARANJA",
        imagem: "carrinho-de-mao-aco-laranja-60l.png",
        alt: "Carrinho de mão de aço com caçamba laranja e pneu preto",
        itens: [
            { codigo: "204941", descricao: "60L", embalagem: "UN" }
        ]
    }
];
