/* =========================================================
   ANIMAÇÕES - parte em JavaScript (reutilizável)

   1. Números dos cards "sobem" até o valor (contagem)
   2. Itens da lista entram em sequência (só na primeira vez
      ou quando a quantidade aumenta; não repete a cada
      atualização de cotação)
   3. Efeito de onda ao clicar em botões principais

   Carregar DEPOIS dos scripts da página.
========================================================= */

(function () {

    "use strict";

    const reduzir = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduzir) {
        return;
    }


    /* =========================
       1. CONTAGEM DOS NÚMEROS
    ========================= */

    const NUMERO = /-?\d[\d.]*(?:,\d+)?/;

    function paraNumero(texto) {
        return Number(texto.replace(/\./g, "").replace(",", "."));
    }

    function contar(el) {

        let escrevendo = false;
        let ultimo = null;
        let quadro = 0;

        function lerTexto() {
            const m = el.textContent.match(NUMERO);

            return m
                ? { alvo: paraNumero(m[0]), casas: (m[0].split(",")[1] || "").length, m }
                : null;
        }

        let observador = null;

        function escrever(texto) {
            escrevendo = true;
            el.textContent = texto;
            escrevendo = false;

            /* descarta o aviso da nossa própria escrita (ele chegaria
               depois e reiniciaria a contagem com um valor intermediário) */
            if (observador) {
                observador.takeRecords();
            }
        }

        function aoMudar() {

            if (escrevendo) {
                return;
            }

            const info = lerTexto();

            if (!info || info.alvo === ultimo) {
                return;
            }

            const textoFinal = el.textContent;
            const antes = textoFinal.slice(0, info.m.index);
            const depois = textoFinal.slice(info.m.index + info.m[0].length);
            const de = ultimo === null ? 0 : ultimo;
            const ate = info.alvo;
            const inicio = performance.now();
            const duracao = 1600;

            ultimo = ate;
            cancelAnimationFrame(quadro);

            function passo(agora) {

                const t = Math.min((agora - inicio) / duracao, 1);
                const suave = 1 - Math.pow(1 - t, 3);
                const valor = de + (ate - de) * suave;

                if (t < 1) {

                    escrever(
                        antes +
                        valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: info.casas,
                            maximumFractionDigits: info.casas
                        }) +
                        depois
                    );

                    quadro = requestAnimationFrame(passo);

                } else {

                    /* termina exatamente no texto original */
                    escrever(textoFinal);
                }
            }

            quadro = requestAnimationFrame(passo);
        }

        observador = new MutationObserver(aoMudar);

        observador.observe(el, {
            childList: true,
            characterData: true,
            subtree: true
        });

        aoMudar();
    }

    ["totalMonth", "monthlyAverage", "activeRecurring", "cardTotal", "cardAdded", "cardRemoved", "cardMoves"].forEach(id => {
        const el = document.getElementById(id);

        if (el) {
            contar(el);
        }
    });


    /* =========================
       2. LISTA DE APORTES
       - itens entram em sequência (1ª vez ou quando a quantidade sobe)
       - item excluído desliza para fora (usa uma cópia "fantasma"
         do item antigo, porque o Aportes.js apaga e redesenha tudo)
    ========================= */

    const lista = document.getElementById("contributionList");

    let ultimoPedidoExclusao = 0;

    document.addEventListener("click", e => {
        if (e.target.closest("[data-delete], #clearAllBtn")) {
            ultimoPedidoExclusao = Date.now();
        }
    }, true);

    if (lista) {

        let anteriores = [];     /* [{ id, copia }] do último desenho */
        let observadorLista = null;

        const itensReais = () => Array.from(
            lista.querySelectorAll(".aporte-item:not(.anim-saindo)")
        );

        const idDe = item => {
            const botao = item.querySelector("[data-delete]");
            return botao ? botao.dataset.delete : null;
        };

        observadorLista = new MutationObserver(() => {

            const itens = itensReais();
            const atuais = itens.map(idDe);

            /* ---- itens que sumiram depois de um pedido de exclusão ---- */
            const foiExclusao = Date.now() - ultimoPedidoExclusao < 20000;

            if (foiExclusao && anteriores.length > itens.length) {

                let posicao = 0;
                let ordem = 0;

                anteriores.forEach(antigo => {

                    if (antigo.id !== null && atuais.includes(antigo.id)) {
                        posicao++;
                        return;
                    }

                    const fantasma = antigo.copia.cloneNode(true);

                    fantasma.classList.remove("anim-item");
                    fantasma.classList.add("anim-saindo");
                    fantasma.style.setProperty("--o", ordem++);
                    fantasma.setAttribute("aria-hidden", "true");

                    lista.insertBefore(fantasma, itensReais()[posicao] || null);

                    fantasma.addEventListener("animationend", () => fantasma.remove());
                    setTimeout(() => fantasma.remove(), 2500);
                });
            }

            /* ---- entrada em sequência ---- */
            if (itens.length > anteriores.length) {

                itens.forEach((item, i) => {
                    item.style.setProperty("--i", Math.min(i, 10));
                    item.classList.add("anim-item");
                });
            }

            anteriores = itens.map(item => ({
                id: idDe(item),
                copia: item.cloneNode(true)
            }));

            /* a inserção dos fantasmas não deve disparar nova rodada */
            observadorLista.takeRecords();
        });

        observadorLista.observe(lista, { childList: true });
    }


    /* =========================
       COTAÇÃO "AO VIVO"
       Pisca verde (subiu) ou vermelho (caiu) quando o preço
       do mesmo ativo muda.
    ========================= */

    const preco = document.getElementById("assetPrice");
    const seletorAtivo = document.getElementById("asset");

    if (preco) {

        const ultimos = {};
        let tempoPisca = null;

        new MutationObserver(() => {

            const m = preco.textContent.match(NUMERO);
            const chave = seletorAtivo ? seletorAtivo.value : "";

            if (!m) {
                return;
            }

            const valor = paraNumero(m[0]);
            const antes = ultimos[chave];

            ultimos[chave] = valor;

            if (antes === undefined || antes === valor) {
                return;
            }

            preco.removeAttribute("data-pisca");
            void preco.offsetWidth;
            preco.setAttribute("data-pisca", valor > antes ? "up" : "down");

            clearTimeout(tempoPisca);
            tempoPisca = setTimeout(() => preco.removeAttribute("data-pisca"), 2200);

        }).observe(preco, { childList: true, characterData: true, subtree: true });
    }


    /* =========================
       CONFIRMAR APORTE
       O botão vira "check" verde quando o aviso diz "sucesso".
    ========================= */

    const aviso = document.getElementById("toastMessage");
    const botaoConfirmar = document.getElementById("confirmBtn");

    if (aviso && botaoConfirmar) {

        let tempoOk = null;

        new MutationObserver(() => {

            if (!/sucesso/i.test(aviso.textContent)) {
                return;
            }

            botaoConfirmar.classList.remove("ok");
            void botaoConfirmar.offsetWidth;
            botaoConfirmar.classList.add("ok");

            clearTimeout(tempoOk);
            tempoOk = setTimeout(() => botaoConfirmar.classList.remove("ok"), 2400);

        }).observe(aviso, { childList: true, characterData: true, subtree: true });
    }


    /* =========================
       3. ONDA NO CLIQUE
    ========================= */

    document.addEventListener("click", e => {

        const botao = e.target.closest(".confirm-btn, .quick-values button, .pp-chips button, .pp-change, .filters button");

        if (!botao) {
            return;
        }

        const caixa = botao.getBoundingClientRect();
        const onda = document.createElement("span");

        onda.className = "anim-onda";
        onda.style.left = `${e.clientX - caixa.left}px`;
        onda.style.top = `${e.clientY - caixa.top}px`;

        botao.appendChild(onda);

        setTimeout(() => onda.remove(), 650);
    });

})();