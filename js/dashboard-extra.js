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

        const texto = document.querySelector(".v2-page-head p");

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

            return (data.aportes || []).filter(a => !a.removido_em);

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

            const limite = chaveData(fimDoMes);
            const acumulado = dadosGrafico.aportes
                .filter(a => a.data_aporte && String(a.data_aporte).slice(0, 10) <= limite)
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
        if (!blocoGrafico) return;

        if (dadosGrafico.aportes.length === 0) {
            blocoGrafico.innerHTML = `
                <div class="chart-placeholder">
                    <i class="bi bi-graph-up-arrow"></i>
                    <span>Faça seu primeiro aporte para acompanhar a evolução</span>
                </div>`;
            return;
        }

        const serie = montarSerie();
        const n = serie.length;
        if (!n) return;
        const investido = Number(serie[n - 1].valor) || 0;
        const atual = dadosGrafico.valorAtual === null ? null : Number(dadosGrafico.valorAtual);
        const variacao = atual === null ? null : atual - investido;
        const variacaoPct = variacao !== null && investido > 0 ? (variacao / investido) * 100 : null;
        const maior = Math.max(...serie.map(p => p.valor), atual === null ? 0 : atual, 1);
        const menor = Math.min(0, ...serie.map(p => p.valor), atual === null ? 0 : atual);
        const L = 1020, A = 340, left = 80, right = 44, top = 30, bottom = 48;
        const w = L - left - right, h = A - top - bottom;
        const pad = Math.max((maior - menor) * .14, 1);
        const vmax = maior + pad;
        const vmin = Math.min(0, menor - (menor < 0 ? pad : 0));
        const x = i => left + (n === 1 ? w / 2 : i * w / (n - 1));
        const y = v => top + (vmax - v) / (vmax - vmin || 1) * h;
        const base = y(0);
        const pathLine = pontos => {
            if (pontos.length === 1) return `M ${pontos[0][0]} ${pontos[0][1]}`;
            let s = `M ${pontos[0][0]} ${pontos[0][1]}`;
            for (let i = 0; i < pontos.length - 1; i++) {
                const p = pontos[i], q = pontos[i + 1], dx = (q[0] - p[0]) / 2;
                s += ` C ${p[0] + dx} ${p[1]}, ${q[0] - dx} ${q[1]}, ${q[0]} ${q[1]}`;
            }
            return s;
        };
        const pts = serie.map((p, i) => [x(i), y(p.valor)]);
        const linha = pathLine(pts);
        const area = `${linha} L ${x(n - 1)} ${base} L ${x(0)} ${base} Z`;
        const percentual = p => p === null ? '—' : `${p > 0 ? '+' : ''}${p.toLocaleString('pt-BR', {maximumFractionDigits:2, minimumFractionDigits:2})}%`;
        const fmtSigned = v => v === null ? '—' : `${v > 0 ? '+' : v < 0 ? '−' : ''}${money(Math.abs(v))}`;
        const pico = Math.max(...serie.map(p => p.valor));
        const bars = [
            ['Total investido', money(investido), 'bi-wallet2', 'blue'],
            ['Valor atual', atual === null ? 'Indisponível' : money(atual), 'bi-graph-up-arrow', 'cyan'],
            ['Diferença atual', fmtSigned(variacao), 'bi-arrow-left-right', variacao === null ? 'muted' : variacao >= 0 ? 'green' : 'red'],
            ['Variação sobre aportes', percentual(variacaoPct), 'bi-percent', variacaoPct === null ? 'muted' : variacaoPct >= 0 ? 'green' : 'red']
        ];
        const cards = bars.map(([label, value, icon, tone]) => `
            <div class="acc-chart-stat acc-stat-${tone}">
                <span class="acc-chart-stat-label"><i class="bi ${icon}" aria-hidden="true"></i> ${label}</span>
                <strong>${value}</strong>
            </div>`).join('');

        let grade = '';
        for (let i = 0; i <= 4; i++) {
            const valor = vmin + (vmax - vmin) * (i / 4);
            const yy = y(valor);
            grade += `<line x1="${left}" x2="${L - right}" y1="${yy}" y2="${yy}" class="acc-chart-gridline" />
                <text x="${left - 14}" y="${yy + 4}" text-anchor="end" class="acc-chart-axis">${moneyCurto(valor)}</text>`;
        }
        const meses = serie.map((p, i) => `<text x="${x(i)}" y="${A - 14}" text-anchor="middle" class="acc-chart-axis">${p.rotulo}</text>`).join('');
        const pontos = serie.map((p, i) => `<circle class="acc-point" cx="${x(i)}" cy="${y(p.valor)}" r="5" tabindex="0" data-point="${i}" aria-label="${p.rotulo}: ${money(p.valor)} investidos" />`).join('');
        const ultimoX = x(n - 1);
        const valorAtual = atual === null ? '' : `
            <line x1="${ultimoX}" x2="${ultimoX}" y1="${y(investido)}" y2="${y(atual)}" class="acc-chart-current-link" />
            <circle cx="${ultimoX}" cy="${y(atual)}" r="9" class="acc-chart-current-halo" />
            <circle cx="${ultimoX}" cy="${y(atual)}" r="5.5" class="acc-chart-current-dot" />`;

        blocoGrafico.innerHTML = `
            <div class="acc-chart-shell">
                <div class="acc-chart-stats">${cards}</div>
                <div class="acc-chart-plot" tabindex="0" aria-label="Gráfico de aportes acumulados. Use os pontos ou o mouse para consultar os meses.">
                    <svg viewBox="0 0 ${L} ${A}" role="img" aria-label="Evolução do valor investido acumulado por mês">
                        <defs>
                            <linearGradient id="acc-invest-area" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stop-color="#438cff" stop-opacity=".37" />
                                <stop offset="100%" stop-color="#438cff" stop-opacity="0" />
                            </linearGradient>
                            <linearGradient id="acc-invest-line" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stop-color="#4278ff" />
                                <stop offset="100%" stop-color="#61b8ff" />
                            </linearGradient>
                        </defs>
                        ${grade}
                        <path d="${area}" fill="url(#acc-invest-area)" />
                        <path d="${linha}" class="acc-chart-invest-line" />
                        ${valorAtual}
                        <line class="acc-chart-crosshair" x1="${ultimoX}" x2="${ultimoX}" y1="${top}" y2="${A - bottom}" style="display:none" />
                        ${pontos}${meses}
                    </svg>
                    <div class="acc-chart-tooltip" role="status" aria-live="polite" hidden></div>
                </div>
                <div class="acc-chart-footer">
                    <span><i class="acc-legend-dot acc-legend-blue"></i> Aportes acumulados</span>
                    <span><i class="acc-legend-dot acc-legend-green"></i> Valor atual (apenas hoje)</span>
                    <span class="acc-chart-note">Passe o mouse sobre os pontos para ver os valores mensais.</span>
                </div>
            </div>`;

        const plot = blocoGrafico.querySelector('.acc-chart-plot');
        const svg = plot.querySelector('svg');
        const tooltip = plot.querySelector('.acc-chart-tooltip');
        const crosshair = svg.querySelector('.acc-chart-crosshair');
        const circles = Array.from(svg.querySelectorAll('.acc-point'));
        const show = i => {
            if (i < 0 || i >= n) return;
            const p = serie[i];
            circles.forEach((el, idx) => el.classList.toggle('acc-point-active', i === idx));
            crosshair.style.display = '';
            crosshair.setAttribute('x1', x(i));
            crosshair.setAttribute('x2', x(i));
            tooltip.hidden = false;
            tooltip.textContent = `${p.rotulo} · Total investido: ${money(p.valor)}`;
            tooltip.style.left = `${Math.min(82, Math.max(18, x(i) / L * 100))}%`;
        };
        const hide = () => {
            crosshair.style.display = 'none';
            circles.forEach(el => el.classList.remove('acc-point-active'));
            tooltip.hidden = true;
        };
        circles.forEach((el, i) => {
            el.addEventListener('mouseenter', () => show(i));
            el.addEventListener('focus', () => show(i));
            el.addEventListener('click', () => show(i));
            el.addEventListener('blur', hide);
        });
        plot.addEventListener('mousemove', event => {
            const rect = svg.getBoundingClientRect();
            const relative = (event.clientX - rect.left) / (rect.width || 1);
            const idx = Math.round((relative * L - left) / (w / Math.max(1, n - 1)));
            show(Math.min(n - 1, Math.max(0, idx)));
        });
        plot.addEventListener('mouseleave', hide);
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
            console.log("aportes do gráfico:", aportes);

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
(function () {

    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    const cards = document.querySelectorAll(".grid .card");

    if (!cards.length) {
        return;
    }

    let distribuicao = null;
    let dashboardPintou = false;
    let aplicado = false;
    let observador = null;

    function dinheiro(valor) {
        return (Number(valor) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    /* mesma ordem dos cards: 0 Renda fixa | 1 Renda variável | 2 Cripto | 3 Outros */
    function indiceDoCard(categoria) {

        switch (categoria) {
            case "Renda Fixa": return 0;
            case "Ações":
            case "FIIs": return 1;
            case "Cripto": return 2;
            default: return 3;
        }
    }

    function aplicar() {

        if (aplicado || !distribuicao) {
            return;
        }

        aplicado = true;

        if (observador) {
            observador.disconnect();
        }

        const valores = [0, 0, 0, 0];

        distribuicao.itens.forEach(item => {
            valores[indiceDoCard(item.categoria)] += Number(item.valor) || 0;
        });

        const total = valores.reduce((soma, v) => soma + v, 0);

        valores.forEach((valor, i) => {

            const p = cards[i] && cards[i].querySelector("p");
            const span = cards[i] && cards[i].querySelector("span");

            if (p) {
                p.textContent = dinheiro(valor);
            }

            if (span) {

                const parte = total > 0 ? (valor / total) * 100 : 0;

                span.textContent = `${parte.toLocaleString("pt-BR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                })}% da carteira`;
            }
        });
    }

    /* espera o código acima pintar os cards primeiro, para o nosso valor ficar por cima */
    function observarCards() {

        observador = new MutationObserver(() => {
            dashboardPintou = true;
            aplicar();
        });

        cards.forEach(card => {
            observador.observe(card, { childList: true, characterData: true, subtree: true });
        });

        /* se o dashboard não mexer nos cards, aplica mesmo assim depois de um tempo */
        setTimeout(() => {
            dashboardPintou = true;
            aplicar();
        }, 8000);
    }

    async function carregar() {

        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {

            const resposta = await fetch(`${API_BASE_URL}/carteiras/distribuicao`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const dados = await resposta.json();

            if (!resposta.ok || dados.sucesso !== true) {
                throw new Error(dados.mensagem || `HTTP ${resposta.status}`);
            }

            distribuicao = { itens: dados.distribuicao || [] };

            if (dashboardPintou) {
                aplicar();
            }

        } catch (erro) {
            console.error("Erro ao buscar a distribuição da carteira:", erro);
        }
    }

    observarCards();
    carregar();

})();