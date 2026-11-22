/* =========================================================
   ANIMAÇÕES DA PÁGINA CARTEIRA - parte em JavaScript

   1. Números dos cards "sobem" até o valor (contagem)
   2. Abas das carteiras entram em sequência (1ª vez) e a aba
      escolhida dá um "pop"
   3. Linhas da tabela entram em sequência (só quando a lista de
      ativos muda; não repete a cada atualização de cotação)
   4. Gráfico de pizza é "desenhado" e a legenda entra em sequência
   5. Efeito de onda ao clicar nos botões
   6. Destaque da fatia do gráfico ao passar o mouse

   Carregar DEPOIS dos scripts da página (carteira-aportes.js).
========================================================= */

(function () {

    "use strict";

    /* =========================
       DESTAQUE DA FATIA DO GRÁFICO
       Passar o mouse numa fatia (ou na linha da legenda) destaca
       aquela fatia, escurece as outras e mostra um balão com o
       nome e a participação. Roda mesmo com "reduzir movimento"
       (o CSS tira só a escala/deslocamento).
    ========================= */

    (function destaqueFatia() {

        const grafico = document.getElementById("distributionChart");
        const legenda = document.getElementById("distributionLegend");

        if (!grafico || !legenda) {
            return;
        }

        let atual = -1;

        const dica = document.createElement("div");

        dica.className = "ca-dica";
        dica.setAttribute("aria-hidden", "true");
        document.body.appendChild(dica);

        const linhas = () => Array.from(legenda.children)
            .filter(el => !el.classList.contains("legend-empty"));

        /* início e fim (em %) de cada fatia, na mesma ordem da legenda */
        function fatias() {

            let inicio = 0;

            return linhas().map(linha => {

                const texto = (linha.lastElementChild || linha).textContent
                    .replace("%", "").trim();

                const pct = Number(texto.replace(/\./g, "").replace(",", ".")) || 0;
                const fatia = { ini: inicio, fim: inicio + pct };

                inicio += pct;

                return fatia;
            });
        }

        function posicionarDica(x, y) {

            const w = dica.offsetWidth;
            const h = dica.offsetHeight;

            dica.style.left = Math.max(8, Math.min(x + 14, window.innerWidth - w - 8)) + "px";
            dica.style.top = Math.max(8, Math.min(y + 16, window.innerHeight - h - 8)) + "px";
        }

        function definir(indice, x, y) {

            const itens = linhas();

            itens.forEach((linha, i) => linha.classList.toggle("ca-ativo", i === indice));
            legenda.classList.toggle("ca-tem-ativo", indice >= 0);

            if (indice < 0 || !itens[indice]) {

                grafico.classList.remove("ca-hover");
                dica.classList.remove("ca-mostra");
                atual = -1;
                return;
            }

            if (indice !== atual) {

                const f = fatias()[indice];

                grafico.style.setProperty("--ca-s", f.ini + "%");
                grafico.style.setProperty("--ca-e", Math.min(f.fim, 100) + "%");

                const linha = itens[indice];
                const nome = linha.querySelector(".legend-name");
                const ponto = linha.querySelector(".legend-dot");

                dica.textContent = "";

                const bolinha = document.createElement("i");
                const titulo = document.createElement("b");
                const valor = document.createElement("span");

                bolinha.style.background = ponto ? ponto.style.background : "";
                titulo.textContent = nome ? nome.textContent.trim() : "";
                valor.textContent = (linha.lastElementChild || linha).textContent.trim();

                dica.append(bolinha, titulo, valor);
            }

            atual = indice;
            grafico.classList.add("ca-hover");

            /* o balão só aparece quando o mouse está no gráfico */
            if (x !== undefined) {

                dica.classList.add("ca-mostra");
                posicionarDica(x, y);

            } else {

                dica.classList.remove("ca-mostra");
            }
        }

        /* ---- mouse no gráfico: descobre a fatia pelo ângulo ---- */

        function aoMover(e) {

            /* sem dados, ou ainda desenhando o gráfico */
            if (!grafico.style.background || grafico.classList.contains("anim-donut")) {
                definir(-1);
                return;
            }

            const caixa = grafico.getBoundingClientRect();
            const dx = e.clientX - (caixa.left + caixa.width / 2);
            const dy = e.clientY - (caixa.top + caixa.height / 2);

            if (Math.hypot(dx, dy) > grafico.offsetWidth / 2) {
                definir(-1);
                return;
            }

            let angulo = Math.atan2(dx, -dy) * 180 / Math.PI;

            if (angulo < 0) {
                angulo += 360;
            }

            const pct = angulo / 360 * 100;
            const lista = fatias();

            let indice = lista.findIndex(f => pct >= f.ini && pct < f.fim);

            if (indice < 0 && lista.length) {
                indice = lista.length - 1;
            }

            definir(indice, e.clientX, e.clientY);
        }

        grafico.addEventListener("pointermove", aoMover);
        grafico.addEventListener("pointerdown", aoMover);
        grafico.addEventListener("pointerleave", () => definir(-1));

        /* ---- mouse na legenda: destaca a fatia correspondente ---- */

        legenda.addEventListener("mouseover", e => {

            const linha = e.target.closest(".legend > div");

            if (!linha || linha.classList.contains("legend-empty") || !grafico.style.background) {
                return;
            }

            definir(linhas().indexOf(linha));
        });

        legenda.addEventListener("mouseleave", () => definir(-1));

        /* o gráfico foi redesenhado (outra carteira, novo aporte...) */
        new MutationObserver(() => definir(-1)).observe(legenda, { childList: true });
    })();


    const reduzir = window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduzir) {
        return;
    }

    const $ = id => document.getElementById(id);


    /* =========================
       1. CONTAGEM DOS NÚMEROS
    ========================= */

    const NUMERO = /\d[\d.]*(?:,\d+)?/;

    function paraNumero(texto) {
        return Number(texto.replace(/\./g, "").replace(",", "."));
    }

    function contar(el) {

        let escrevendo = false;
        let ultimo = null;
        let quadro = 0;
        let observador = null;

        function escrever(texto) {
            escrevendo = true;
            el.textContent = texto;
            escrevendo = false;

            /* descarta o aviso da nossa própria escrita */
            if (observador) {
                observador.takeRecords();
            }
        }

        function aoMudar() {

            if (escrevendo) {
                return;
            }

            const m = el.textContent.match(NUMERO);

            if (!m) {
                return;
            }

            const alvo = paraNumero(m[0]);

            if (alvo === ultimo) {
                return;
            }

            const casas = (m[0].split(",")[1] || "").length;
            const textoFinal = el.textContent;
            const antes = textoFinal.slice(0, m.index);
            const depois = textoFinal.slice(m.index + m[0].length);
            const de = ultimo === null ? 0 : ultimo;
            const inicio = performance.now();
            const duracao = 1100;

            ultimo = alvo;
            cancelAnimationFrame(quadro);

            function passo(agora) {

                const t = Math.min((agora - inicio) / duracao, 1);
                const suave = 1 - Math.pow(1 - t, 3);
                const valor = de + (alvo - de) * suave;

                if (t < 1) {

                    escrever(
                        antes +
                        valor.toLocaleString("pt-BR", {
                            minimumFractionDigits: casas,
                            maximumFractionDigits: casas
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

    ["totalEquity", "totalInvested", "totalYield"].forEach(id => {
        const el = $(id);

        if (el) {
            contar(el);
        }
    });


    /* =========================
       2. ABAS DAS CARTEIRAS
    ========================= */

    const abas = $("walletTabs");

    if (abas) {

        let primeiraVez = true;
        let ativaAntes = null;

        new MutationObserver(() => {

            const botoes = Array.from(abas.querySelectorAll(".wallet-tab"));

            if (!botoes.length) {
                return;
            }

            const ativa = abas.querySelector(".wallet-tab.active");
            const nomeAtiva = ativa ? ativa.textContent : null;

            if (primeiraVez) {

                primeiraVez = false;

                botoes.forEach((botao, i) => {
                    botao.style.setProperty("--i", Math.min(i, 8));
                    botao.classList.add("anim-tab");
                });

            } else if (ativa && nomeAtiva !== ativaAntes) {

                ativa.classList.add("anim-ativa");
            }

            ativaAntes = nomeAtiva;

        }).observe(abas, { childList: true });
    }


    /* =========================
       3. TABELA DE INVESTIMENTOS
    ========================= */

    const corpo = $("assetsBody");

    if (corpo) {

        let assinatura = null;

        new MutationObserver(() => {

            const linhas = Array.from(corpo.querySelectorAll("tr"));

            const atual = linhas
                .map(tr => tr.cells[0] ? tr.cells[0].textContent.trim() : "")
                .join("|");

            /* só anima quando a lista de ativos muda (trocar de
               carteira, novo aporte...), não a cada cotação nova */
            if (atual === assinatura) {
                return;
            }

            assinatura = atual;

            linhas.forEach((tr, i) => {
                tr.style.setProperty("--i", Math.min(i, 10));
                tr.classList.add("anim-linha");
            });

        }).observe(corpo, { childList: true });
    }

    const contador = $("assetsCount");

    if (contador) {

        let textoAntes = null;

        new MutationObserver(() => {

            const texto = contador.textContent;

            if (texto === textoAntes) {
                return;
            }

            const eraPrimeira = textoAntes === null;

            textoAntes = texto;

            if (eraPrimeira) {
                return;
            }

            contador.classList.remove("anim-pop");
            void contador.offsetWidth;
            contador.classList.add("anim-pop");

        }).observe(contador, { childList: true, characterData: true, subtree: true });
    }


    /* =========================
       4. GRÁFICO DE DISTRIBUIÇÃO
    ========================= */

    const grafico = $("distributionChart");

    if (grafico) {

        let fundoAntes = "";

        grafico.addEventListener("animationend", e => {
            if (e.target === grafico && e.animationName === "ca-donut") {
                grafico.classList.remove("anim-donut");
            }
        });

        new MutationObserver(() => {

            const fundo = grafico.style.background;

            if (fundo === fundoAntes) {
                return;
            }

            fundoAntes = fundo;

            /* sem dados = sem gráfico, nada para desenhar */
            if (!fundo) {
                grafico.classList.remove("anim-donut");
                return;
            }

            grafico.classList.remove("anim-donut");
            void grafico.offsetWidth;
            grafico.classList.add("anim-donut");

        }).observe(grafico, { attributes: true, attributeFilter: ["style"] });
    }

    const legenda = $("distributionLegend");

    if (legenda) {

        let textoLegenda = null;

        new MutationObserver(() => {

            const texto = legenda.textContent.replace(/\s+/g, " ").trim();

            if (texto === textoLegenda) {
                return;
            }

            textoLegenda = texto;

            Array.from(legenda.children).forEach((item, i) => {
                item.style.setProperty("--i", Math.min(i, 8));
                item.classList.add("anim-legenda");
            });

        }).observe(legenda, { childList: true });
    }


    /* =========================
       5. ONDA NO CLIQUE
    ========================= */

    document.addEventListener("click", e => {

        const botao = e.target.closest(".wallet-btn, .wallet-tab, .cw-btn");

        if (!botao || botao.disabled) {
            return;
        }

        const caixa = botao.getBoundingClientRect();
        const onda = document.createElement("span");

        onda.className = "ca-onda";
        onda.style.left = `${e.clientX - caixa.left}px`;
        onda.style.top = `${e.clientY - caixa.top}px`;

        botao.appendChild(onda);

        setTimeout(() => onda.remove(), 650);
    });

})();