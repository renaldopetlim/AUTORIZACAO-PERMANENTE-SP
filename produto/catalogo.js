/*
 * Monta os cards a partir de window.PRODUTOS usando o <template id="tpl-produto">.
 * Usa textContent em tudo, então nenhum dado é interpretado como HTML.
 */
(function () {
    function criarCard(tpl, produto) {
        var card = tpl.content.firstElementChild.cloneNode(true);

        card.querySelector(".produto__titulo").textContent = produto.titulo || "";

        var img = card.querySelector(".produto__imagem img");
        img.src = produto.imagem || "";
        img.alt = produto.alt || produto.titulo || "";

        var tbody = card.querySelector(".produto__tabela tbody");
        (produto.itens || []).forEach(function (item) {
            var tr = document.createElement("tr");
            [item.codigo, item.descricao, item.embalagem].forEach(function (valor) {
                var td = document.createElement("td");
                td.textContent = valor == null ? "" : valor;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        return card;
    }

    function renderizar(produtos, destino) {
        var tpl = document.getElementById("tpl-produto");
        var frag = document.createDocumentFragment();
        produtos.forEach(function (p) { frag.appendChild(criarCard(tpl, p)); });
        destino.replaceChildren(frag);
    }

    // Disponível para uso externo, ex.: Catalogo.renderizar(lista, elemento)
    window.Catalogo = { renderizar: renderizar };

    document.addEventListener("DOMContentLoaded", function () {
        var destino = document.getElementById("catalogo");
        if (destino && window.PRODUTOS) renderizar(window.PRODUTOS, destino);
    });
})();
