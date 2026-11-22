/* =========================================================
   ANIMAÇÕES DA PÁGINA DASHBOARD - parte em JavaScript

   1. Os valores (saldo, total investido, cards, % ...) "sobem"
      até o número final. Funciona sozinho com as atualizações
      dos outros scripts (dashboard-total.js, dashboard-extra.js,
      cotações): sempre que o texto muda, o número conta do valor
      que estava na tela até o novo.
   2. O gráfico é "desenhado" (linha, área e pontos) toda vez que
      o dashboard-extra.js o redesenha (inclusive ao trocar 3/6/12
      meses).

   Não altera nenhum outro arquivo. Carregar por ÚLTIMO,
   depois do dashboard-total.js.
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

    const NUMERO = /\d[\d.]*(?:,\d+)?/;
    const DURACAO = 1400;

    function paraNumero(texto) {
        return Number(texto.replace(/\./g, "").replace(",", "."));
    }

    function contar(el) {

        let escrevendo = false;
        let alvoAtual = null;     /* último valor final recebido */
        let exibido = 0;          /* valor que está na tela agora */
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

            const textoFinal = el.textContent;
            const m = textoFinal.match(NUMERO);

            if (!m) {
                return;
            }

            const ate = paraNumero(m[0]);

            if (ate === alvoAtual) {
                return;
            }

            const casas = (m[0].split(",")[1] || "").length;
            const antes = textoFinal.slice(0, m.index);
            const depois = textoFinal.slice(m.index + m[0].length);
            const de = exibido;
            const inicio = performance.now();

            alvoAtual = ate;
            cancelAnimationFrame(quadro);

            function passo(agora) {

                const t = Math.min((agora - inicio) / DURACAO, 1);
                const suave = 1 - Math.pow(1 - t, 3);

                exibido = de + (ate - de) * suave;

                if (t < 1) {

                    escrever(
                        antes +
                        exibido.toLocaleString("pt-BR", {
                            minimumFractionDigits: casas,
                            maximumFractionDigits: casas
                        }) +
                        depois
                    );

                    quadro = requestAnimationFrame(passo);

                } else {

                    exibido = ate;

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

    [
        ".card-big h2",
        ".card-big .stats strong",
        ".card-big .badge",
        ".grid .card p",
        ".grid .card span"
    ].forEach(seletor => {
        document.querySelectorAll(seletor).forEach(contar);
    });


    /* =========================
       2. GRÁFICO "DESENHADO"
       O dashboard-extra.js troca todo o conteúdo do .chart-box
       (innerHTML); quando isso acontece, marcamos as partes do
       SVG com classes para o CSS animar.
    ========================= */

    const caixaGrafico = document.querySelector(".chart-box");

    function prepararGrafico() {

        const svg = caixaGrafico.querySelector("svg");

        if (!svg) {
            return;
        }

        /* grade e rótulos (linhas tracejadas, textos) */
        svg.querySelectorAll("line").forEach(l => l.classList.add("dash-g-grade"));
        svg.querySelectorAll("text").forEach(t => t.classList.add("dash-g-rotulo"));

        svg.querySelectorAll("path").forEach(p => {

            const preenchimento = p.getAttribute("fill") || "";

            if (preenchimento.indexOf("url(") === 0) {

                /* área em degradê sob a linha */
                p.classList.add("dash-g-area");

            } else if (p.getAttribute("stroke-width") === "3") {

                /* linha principal: pathLength=1 deixa o "traço"
                   independente do tamanho real da linha */
                p.setAttribute("pathLength", "1");
                p.classList.add("dash-g-linha");
            }
        });

        svg.querySelectorAll("circle").forEach((c, i) => {
            c.style.setProperty("--i", i);
            c.classList.add("dash-g-ponto");
        });
    }

    if (caixaGrafico) {

        /* só childList (sem subtree): mexer nas classes do SVG
           não dispara o observador de novo */
        new MutationObserver(prepararGrafico).observe(caixaGrafico, {
            childList: true
        });

        prepararGrafico();
    }

})();