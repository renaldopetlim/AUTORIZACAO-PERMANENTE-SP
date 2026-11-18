/*
 * Monta os cards a partir de window.PRODUTOS usando o <template id="tpl-produto">.
 * Usa textContent em tudo, então nenhum dado é interpretado como HTML.
 */
(function () {
    var EXT_IMAGEM = /\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i;

    // Marca e selo aceitam texto ou caminho de imagem; vazio = não exibe.
    function preencherEtiqueta(el, valor, rotulo) {
        valor = valor == null ? "" : String(valor).trim();
        if (!valor) return;
        if (EXT_IMAGEM.test(valor)) {
            var img = document.createElement("img");
            img.src = valor;
            img.alt = rotulo;
            el.appendChild(img);
            el.classList.add("is-imagem");
        } else {
            el.textContent = valor;
        }
        el.hidden = false;
    }

    function criarCard(tpl, produto) {
        var card = tpl.content.firstElementChild.cloneNode(true);

        card.querySelector(".produto__titulo").textContent = produto.titulo || "";

        var img = card.querySelector(".produto__foto");
        img.src = produto.imagem || "";
        img.alt = produto.alt || produto.titulo || "";

        preencherEtiqueta(card.querySelector(".produto__marca"), produto.marca, "Marca");
        preencherEtiqueta(card.querySelector(".produto__selo"), produto.selo, "Selo");

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
