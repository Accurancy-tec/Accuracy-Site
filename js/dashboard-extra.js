/* =========================================================
   DASHBOARD - ACRÉSCIMOS
   (carregar DEPOIS do resumoCarteiras.js e ANTES do
   dashboard-total.js)

   Não altera nenhum arquivo existente. Faz:

   1. spinner de carregamento nos blocos;
   2. cards por categoria com valores reais;
   3. gráfico da evolução (total investido acumulado por mês
      + valor atual da carteira hoje);
   4. data de hoje no cabeçalho.
========================================================= */

(function () {

    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    if (typeof ResumoCarteiras === "undefined") {

        console.error(
            "dashboard-extra.js: coloque este script DEPOIS do resumoCarteiras.js"
        );

        return;
    }

    /* Se o loading.js não estiver na página, o dashboard funciona sem spinner */
    const Carregando = typeof Loading !== "undefined"
        ? Loading
        : { on() { }, off() { } };


    /* =====================================================
       1. UMA SÓ BUSCA DO RESUMO
       O dashboard-total.js e este arquivo usam o mesmo
       ResumoCarteiras.load(); guardamos o resultado para
       não chamar a API duas vezes.
    ===================================================== */

    const carregarOriginal = ResumoCarteiras.load;

    let promessaResumo = null;

    ResumoCarteiras.load = function () {

        if (!promessaResumo) {
            promessaResumo = carregarOriginal();
        }

        return promessaResumo;
    };


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const blocoPrincipal = document.querySelector(".card-big");
    const blocoCards = document.querySelector(".grid");
    const blocoGrafico = document.querySelector(".chart-box");
    const botaoFiltro = document.querySelector(".chart-filter");


    /* =====================================================
       FORMATAÇÃO
    ===================================================== */

    function money(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function moneyCurto(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0
        });
    }


    /* =====================================================
       DATA DE HOJE NO CABEÇALHO
    ===================================================== */

    (function dataDeHoje() {

        const titulo = [...document.querySelectorAll("h1")]
            .find(h => h.textContent.trim() === "Dashboard");

        const texto = titulo && titulo.nextElementSibling;

        if (!texto) {
            return;
        }

        const hoje = new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        });

        texto.textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);
    })();


    /* =====================================================
       HISTÓRICO DE APORTES (rota nova da API)
    ===================================================== */

    async function carregarHistorico() {

        const token = localStorage.getItem("token");

        if (!token) {
            return [];
        }

        try {

            const response = await fetch(
                `${API_BASE_URL}/aportes/historico-aportes`,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || data.sucesso !== true) {
                throw new Error(data.mensagem || `HTTP ${response.status}`);
            }

            return data.aportes || [];

        } catch (error) {

            console.error("Erro ao buscar histórico de aportes:", error);

            return [];
        }
    }


    /* =====================================================
       2. CARDS POR CATEGORIA
       Posição na tela: 0 Renda fixa | 1 Renda variável |
       2 Cripto | 3 último card (vira "Outros")
    ===================================================== */

    function preencherCards(resumo, cotacoes) {

        const categorias = {
            fixa: 0,
            variavel: 0,
            cripto: 0,
            outros: 0
        };

        resumo.forEach(carteira => {

            carteira.ativos.forEach(item => {

                const cotacao = cotacoes[item.simbolo_ativo];

                const valor = item.quantidade_item * (
                    cotacao !== undefined && cotacao !== null
                        ? Number(cotacao)
                        : item.preco_medio_item
                );

                switch (item.categoria_ativo) {

                    case "Renda Fixa":
                        categorias.fixa += valor;
                        break;

                    case "Ações":
                    case "FIIs":
                        categorias.variavel += valor;
                        break;

                    case "Cripto":
                        categorias.cripto += valor;
                        break;

                    default:
                        categorias.outros += valor;
                }
            });
        });

        const total = categorias.fixa + categorias.variavel +
            categorias.cripto + categorias.outros;

        const lista = [
            ["Renda fixa", categorias.fixa],
            ["Renda variável", categorias.variavel],
            ["Cripto", categorias.cripto],
            ["Outros", categorias.outros]
        ];

        const cards = document.querySelectorAll(".grid .card");

        lista.forEach(([titulo, valor], i) => {

            const card = cards[i];

            if (!card) {
                return;
            }

            const h4 = card.querySelector("h4");
            const p = card.querySelector("p");
            const span = card.querySelector("span");

            if (h4) {
                h4.textContent = titulo;
            }

            if (p) {
                p.textContent = money(valor);
            }

            if (span) {

                const parte = total > 0 ? (valor / total) * 100 : 0;

                span.classList.remove("green", "red");

                span.textContent = `${parte.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                })}% da carteira`;
            }
        });

        return total;
    }


    /* =====================================================
       3. GRÁFICO DA EVOLUÇÃO
    ===================================================== */

    let periodoMeses = 6;

    let dadosGrafico = {
        aportes: [],
        valorAtual: null
    };


    function chaveData(data) {

        const mes = String(data.getMonth() + 1).padStart(2, "0");
        const dia = String(data.getDate()).padStart(2, "0");

        return `${data.getFullYear()}-${mes}-${dia}`;
    }


    /* Total investido acumulado no fim de cada mês */
    function montarSerie() {

        const agora = new Date();

        const pontos = [];

        for (let k = periodoMeses - 1; k >= 0; k--) {

            const fimDoMes = new Date(
                agora.getFullYear(),
                agora.getMonth() - k + 1,
                0
            );

            const limite = k === 0
                ? chaveData(agora)
                : chaveData(fimDoMes);

            const acumulado = dadosGrafico.aportes
                .filter(a => a.data_aporte && a.data_aporte <= limite)
                .reduce((soma, a) => {

                    const valor = Number(a.valor_aporte) || 0;

                    return a.tipo_aporte === "Venda"
                        ? soma - valor
                        : soma + valor;

                }, 0);

            pontos.push({
                rotulo: fimDoMes.toLocaleDateString("pt-BR", {
                    month: "short",
                    year: "2-digit"
                }).replace(".", ""),
                valor: acumulado
            });
        }

        return pontos;
    }


    function desenharGrafico() {

        if (!blocoGrafico) {
            return;
        }

        if (dadosGrafico.aportes.length === 0) {

            blocoGrafico.innerHTML = `
                <div class="chart-placeholder">
                    <i class="bi bi-bar-chart-line"></i>
                    <span>Faça seu primeiro aporte para acompanhar a evolução</span>
                </div>
            `;

            return;
        }

        const serie = montarSerie();

        const L = 800;
        const A = 300;
        const mEsq = 70;
        const mDir = 30;
        const mTopo = 20;
        const mBase = 40;

        const valores = serie.map(p => p.valor);

        if (dadosGrafico.valorAtual !== null) {
            valores.push(dadosGrafico.valorAtual);
        }

        const maximo = Math.max(...valores, 1) * 1.15;

        const n = serie.length;

        const x = i => mEsq + (n === 1
            ? (L - mEsq - mDir) / 2
            : (i * (L - mEsq - mDir)) / (n - 1));

        const y = v => mTopo + (1 - v / maximo) * (A - mTopo - mBase);

        const caminho = serie
            .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.valor)}`)
            .join(" ");

        const area = `${caminho} L${x(n - 1)},${A - mBase} L${x(0)},${A - mBase} Z`;

        /* linhas de grade e valores do eixo Y */
        let grade = "";

        for (let g = 0; g <= 4; g++) {

            const v = (maximo / 4) * g;

            grade += `
                <line x1="${mEsq}" x2="${L - mDir}" y1="${y(v)}" y2="${y(v)}"
                      stroke="var(--borda-suave, #223b67)" stroke-dasharray="4 6"/>
                <text x="${mEsq - 10}" y="${y(v) + 4}" text-anchor="end"
                      font-size="11" fill="var(--texto-fraco, #7289aa)">${moneyCurto(v)}</text>
            `;
        }

        /* meses no eixo X + bolinhas */
        let rotulos = "";
        let bolinhas = "";

        serie.forEach((p, i) => {

            rotulos += `
                <text x="${x(i)}" y="${A - 14}" text-anchor="middle"
                      font-size="11" fill="var(--texto-fraco, #7289aa)">${p.rotulo}</text>
            `;

            bolinhas += `
                <circle cx="${x(i)}" cy="${y(p.valor)}" r="4"
                        fill="var(--primaria, #3b82f6)">
                    <title>${p.rotulo}: ${money(p.valor)} investidos</title>
                </circle>
            `;
        });

        /* trecho tracejado até o valor atual da carteira (com cotações) */
        let atual = "";

        if (dadosGrafico.valorAtual !== null) {

            const ultimo = serie[n - 1];

            const xAtual = x(n - 1);

            atual = `
                <path d="M${xAtual},${y(ultimo.valor)} L${xAtual},${y(dadosGrafico.valorAtual)}"
                      stroke="var(--verde, #22c55e)" stroke-width="2" stroke-dasharray="5 4"/>
                <circle cx="${xAtual}" cy="${y(dadosGrafico.valorAtual)}" r="5"
                        fill="var(--verde, #22c55e)">
                    <title>Valor atual da carteira: ${money(dadosGrafico.valorAtual)}</title>
                </circle>
            `;
        }

        blocoGrafico.innerHTML = `
            <div style="width:100%;height:100%;display:flex;flex-direction:column">
            <svg viewBox="0 0 ${L} ${A}" style="flex:1;min-height:0;width:100%" role="img"
                 aria-label="Evolução do total investido">
                <defs>
                    <linearGradient id="gradEvolucao" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35"/>
                        <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                    </linearGradient>
                </defs>
                ${grade}
                <path d="${area}" fill="url(#gradEvolucao)"/>
                <path d="${caminho}" fill="none" stroke="var(--primaria, #3b82f6)" stroke-width="3"
                      stroke-linejoin="round" stroke-linecap="round"/>
                ${atual}
                ${bolinhas}
                ${rotulos}
            </svg>
            <p style="flex:none;text-align:center;font-size:12px;margin:6px 0 0;color:var(--texto-fraco, #7289aa)">
                <span style="color:var(--primaria, #3b82f6)">●</span> Total investido acumulado
                &nbsp;&nbsp;
                <span style="color:var(--verde, #22c55e)">●</span> Valor atual da carteira
            </p>
            </div>
        `;
    }


    /* botão "Últimos 6 meses" passa a funcionar: 3 -> 6 -> 12 meses */
    if (botaoFiltro) {

        botaoFiltro.addEventListener("click", () => {

            const opcoes = [3, 6, 12];

            periodoMeses = opcoes[(opcoes.indexOf(periodoMeses) + 1) % opcoes.length];

            botaoFiltro.innerHTML =
                `Últimos ${periodoMeses} meses <i class="bi bi-chevron-down"></i>`;

            desenharGrafico();
        });
    }


    /* =====================================================
       INICIAR
    ===================================================== */

    Carregando.on(blocoPrincipal);
    Carregando.on(blocoCards, { spinner: false });
    Carregando.on(blocoGrafico);

    (async function iniciar() {

        try {

            const [resumo, aportes] = await Promise.all([
                ResumoCarteiras.load(),
                carregarHistorico()
            ]);

            const simbolos = [
                ...new Set(resumo.flatMap(c => c.ativos.map(a => a.simbolo_ativo)))
            ];

            let cotacoes = {};

            if (typeof Cotacoes !== "undefined" && simbolos.length) {
                cotacoes = await Cotacoes.fetch(simbolos);
            }

            const totalInvestimentos = preencherCards(resumo, cotacoes);

            dadosGrafico = {
                aportes,
                valorAtual: simbolos.length ? totalInvestimentos : null
            };

            desenharGrafico();

        } catch (error) {

            console.error("Erro ao montar o dashboard:", error);

        } finally {

            Carregando.off(blocoPrincipal);
            Carregando.off(blocoCards);
            Carregando.off(blocoGrafico);
        }
    })();

})();