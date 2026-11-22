(function () {

    "use strict";

    if (typeof Carteiras === "undefined" || typeof Cotacoes === "undefined") {
        console.error("carteira-aportes: carteiras.js e cotacoes.js precisam ser carregados antes.");
        return;
    }

    const $ = selector => document.querySelector(selector);

    const CORES = [
        "#3b82f6", "#22c55e", "#f59e0b", "#a855f7",
        "#ef4444", "#06b6d4", "#ec4899", "#84cc16"
    ];

    let resumo = [];     // carteiras vindas do banco (cada uma com seus ativos)
    let quotes = {};     // { PETR4: 38.5, ... }


    /* =====================================================
       FORMATAÇÃO
    ===================================================== */

    function money(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function percentText(value) {
        return (Number(value) || 0)
            .toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1
            }) + "%";
    }

    function quantityText(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            maximumFractionDigits: 6
        });
    }

    function escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text ?? "";
        return div.innerHTML;
    }


    /* =====================================================
       BUSCAR O RESUMO NO BANCO
    ===================================================== */

    async function carregarResumo() {

        resumo = await ResumoCarteiras.load();
    }


    /* =====================================================
       QUAL CARTEIRA ESTÁ SELECIONADA
       (mesma regra do carteira.js)
    ===================================================== */

    function activeId() {

        const wallets = Carteiras.list();

        if (wallets.length === 1) {
            return String(wallets[0].id);
        }

        return Carteiras.getActive();
    }


    /* =====================================================
       ATIVOS DA CARTEIRA SELECIONADA
       Na aba "Todas", o mesmo ativo em carteiras
       diferentes é somado numa linha só.
    ===================================================== */

    function selectedData() {

        const active = activeId();

        const wallets = active === "all"
            ? resumo
            : resumo.filter(w => String(w.id_carteira) === String(active));

        const bySymbol = {};
        let freeBalance = 0;

        wallets.forEach(wallet => {

            freeBalance += Number(wallet.saldo_livre_carteira) || 0;

            wallet.ativos.forEach(item => {

                const key = item.simbolo_ativo;
                const cost = item.quantidade_item * item.preco_medio_item;

                if (!bySymbol[key]) {
                    bySymbol[key] = {
                        symbol: key,
                        name: item.nome_ativo,
                        category: item.categoria_ativo || "Outros",
                        quantity: 0,
                        invested: 0
                    };
                }

                bySymbol[key].quantity += item.quantidade_item;
                bySymbol[key].invested += cost;
            });
        });

        const assets = Object.values(bySymbol).map(asset => {

            const quote = quotes[asset.symbol];
            const hasQuote = quote !== undefined && quote !== null;

            // Sem cotação (CDB, "Outro" ou API fora do ar): vale o que foi investido
            const unitPrice = hasQuote
                ? Number(quote)
                : asset.invested / asset.quantity;

            return {
                ...asset,
                hasQuote,
                unitPrice,
                current: asset.quantity * unitPrice
            };
        });

        return { assets, freeBalance };
    }


    /* =====================================================
       RENDERIZAR
    ===================================================== */

    function render() {

        const { assets, freeBalance } = selectedData();

        const invested = assets.reduce((sum, a) => sum + a.invested, 0);
        const current = assets.reduce((sum, a) => sum + a.current, 0);
        const yieldValue = current - invested;
        const yieldPercent = invested > 0 ? (yieldValue / invested) * 100 : 0;
        const equity = current + freeBalance;

        renderCards({ assets, invested, yieldValue, yieldPercent, equity, freeBalance });
        renderTable(assets, current);
        renderAssetCards(assets);
        renderChart(assets, current);
    }


    function renderCards({ assets, invested, yieldValue, yieldPercent, equity, freeBalance }) {

        const totalEquity = $("#totalEquity");
        const equityHint = $("#equityHint");
        const totalInvested = $("#totalInvested");
        const totalYield = $("#totalYield");
        const yieldHint = $("#yieldHint");

        if (totalEquity) totalEquity.textContent = money(equity);

        if (equityHint) {
            equityHint.textContent = freeBalance > 0
                ? `Inclui ${money(freeBalance)} de saldo livre`
                : "Soma dos ativos da carteira";
        }

        if (totalInvested) totalInvested.textContent = money(invested);

        if (totalYield) {

            const sign = yieldValue > 0 ? "+" : "";

            totalYield.textContent = `${sign}${money(yieldValue)}`;
            totalYield.classList.toggle("green", yieldValue >= 0);
            totalYield.classList.toggle("red", yieldValue < 0);
        }

        if (yieldHint) {

            const anyQuote = assets.some(a => a.hasQuote);

            if (!assets.length) {
                yieldHint.textContent = "Sem aportes nesta carteira";
            } else if (!anyQuote) {
                yieldHint.textContent = "Sem cotações disponíveis";
            } else {
                const sign = yieldPercent > 0 ? "+" : "";
                yieldHint.textContent = `${sign}${percentText(yieldPercent)} sobre o investido`;
            }
        }
    }


    function renderTable(assets, current) {

        const body = $("#assetsBody");
        const count = $("#assetsCount");

        if (count) {
            count.textContent = `${assets.length} ${assets.length === 1 ? "ativo" : "ativos"}`;
        }

        if (!body) return;

        if (!assets.length) {
            body.innerHTML = `
                <tr>
                    <td colspan="7" class="table-empty">
                        Nenhum aporte nesta carteira ainda.
                    </td>
                </tr>`;
            return;
        }

        body.innerHTML = assets
            .sort((a, b) => b.current - a.current)
            .map(asset => `
                <tr>
                    <td>
                        <strong>${escapeHtml(asset.symbol)}</strong>
                        <br>
                        <small>${escapeHtml(asset.name)} • ${quantityText(asset.quantity)} un.</small>
                    </td>
                    <td>${escapeHtml(asset.category)}</td>
                    <td>—</td>
                    <td>${money(asset.invested)}</td>
                    <td>${asset.hasQuote ? money(asset.unitPrice) : "—"}</td>
                    <td>${money(asset.current)}</td>
                    <td>${percentText(current > 0 ? (asset.current / current) * 100 : 0)}</td>
                </tr>`)
            .join("");
    }


    /* =====================================================
       CARDS DOS ATIVOS
       Um card por ativo que tem aporte na carteira
       selecionada (na aba "Todas" soma as carteiras).
    ===================================================== */

    const TONS = {
        "Ações": "var(--verde)",
        "FIIs": "var(--amarelo)",
        "Cripto": "#f59e0b",
        "Renda Fixa": "var(--primaria)",
        "Internacional": "#a855f7"
    };

    // PETR4 -> "P4"; BTC -> "BT"
    function iniciais(symbol) {

        const text = String(symbol || "?").toUpperCase();

        return /\d$/.test(text) && text.length > 1
            ? text[0] + text[text.length - 1]
            : text.slice(0, 2);
    }

    let cardAssets = {};          // ativos dos cards: { PETR4: {...} }
    let cardsJaAnimados = false;  // a animação de entrada toca só na 1ª vez

    function percent2(value) {
        return (Number(value) || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + "%";
    }

    function renderAssetCards(assets) {

        const box = $("#assetCards");

        if (!box) return;

        if (!assets.length) {
            box.innerHTML = `
                <div class="asset-cards-empty">
                    Nenhum aporte nesta carteira ainda.
                </div>`;
            return;
        }

        cardAssets = Object.fromEntries(assets.map(asset => [asset.symbol, asset]));

        const animar = !cardsJaAnimados;

        cardsJaAnimados = true;

        box.innerHTML = [...assets]
            .sort((a, b) => b.current - a.current)
            .map((asset, index) => {

                const avgPrice = asset.quantity > 0
                    ? asset.invested / asset.quantity
                    : 0;

                const yieldValue = asset.current - asset.invested;
                const yieldPct = asset.invested > 0
                    ? (yieldValue / asset.invested) * 100
                    : 0;

                // sem cotação o rendimento não existe: fica neutro
                const trend = !asset.hasQuote || Math.abs(yieldValue) < 0.005
                    ? ""
                    : yieldValue > 0 ? "up" : "down";

                const arrow = trend === "up" ? "▲ " : trend === "down" ? "▼ " : "";

                const tone = TONS[asset.category] || "var(--primaria)";

                return `
                    <article class="asset-card${animar ? " is-new" : ""}" data-symbol="${escapeHtml(asset.symbol)}"
                             style="--i:${Math.min(index, 10)};--tone:${tone}">

                        <div class="asset-card-top">
                            <div class="asset-card-icon">${escapeHtml(iniciais(asset.symbol))}</div>

                            <div class="asset-card-title">
                                <strong>${escapeHtml(asset.symbol)}</strong>
                                <small>${escapeHtml(asset.category)} · ${escapeHtml(asset.name)}</small>
                            </div>

                            <div class="asset-card-total">${money(asset.current)}</div>
                        </div>

                        <div class="asset-card-rows">
                            <div class="asset-card-row">
                                <span>Quantidade</span>
                                <b>${quantityText(asset.quantity)}</b>
                            </div>

                            <div class="asset-card-row">
                                <span>Preço médio</span>
                                <b>${money(avgPrice)}</b>
                            </div>

                            <div class="asset-card-row">
                                <span>Preço atual</span>
                                <b>${asset.hasQuote ? money(asset.unitPrice) : "—"}</b>
                            </div>

                            <div class="asset-card-row">
                                <span>Rentabilidade</span>
                                <span class="asset-card-yield">
                                    <span class="pill ${trend}">${arrow}${percent2(Math.abs(yieldPct))}</span>
                                    <b>${money(yieldValue)}</b>
                                </span>
                            </div>
                        </div>

                        <button type="button" class="asset-card-chart"
                                aria-label="Ver gráfico do aporte em ${escapeHtml(asset.symbol)}">
                            <i class="bi bi-graph-up" aria-hidden="true"></i>Ver gráfico
                        </button>

                        <div class="asset-card-actions">
                            <a class="sell" href="aportes.php">Vender</a>
                            <a class="buy" href="aportes.php">Comprar</a>
                        </div>

                    </article>`;
            })
            .join("");
    }


    /* =====================================================
       ALTERNAR CARDS / TABELA
    ===================================================== */

    const VIEW_KEY = "accuracy_carteira_visao";

    function applyView(view) {

        const cards = $("#assetCards");
        const table = $("#assetsTableWrap");

        if (!cards || !table) return;

        cards.hidden = view === "table";
        table.hidden = view !== "table";

        document.querySelectorAll("#viewToggle [data-view]").forEach(button => {
            button.classList.toggle("active", button.dataset.view === view);
        });
    }

    (function initViewToggle() {

        const toggle = $("#viewToggle");

        if (!toggle) return;

        let saved = "cards";

        try {
            saved = localStorage.getItem(VIEW_KEY) === "table" ? "table" : "cards";
        } catch { /* sem storage: fica em cards */ }

        applyView(saved);

        toggle.addEventListener("click", event => {

            const button = event.target.closest("[data-view]");

            if (!button) return;

            applyView(button.dataset.view);

            try {
                localStorage.setItem(VIEW_KEY, button.dataset.view);
            } catch { /* ignora */ }
        });
    })();


    /* =====================================================
       CLIQUE NO CARD -> GRÁFICO DO APORTE
       (clicar em Vender/Comprar continua indo para Aportes)
    ===================================================== */

    function abrirGrafico(symbol) {

        const asset = cardAssets[symbol];

        if (!asset || typeof CarteiraGrafico === "undefined") return;

        const active = activeId();

        CarteiraGrafico.abrir({
            symbol: asset.symbol,
            name: asset.name,
            category: asset.category,
            iniciais: iniciais(asset.symbol),
            tone: TONS[asset.category] || "var(--primaria)",
            carteiraIds: active === "all" ? null : [String(active)]
        });
    }

    (function initCardClick() {

        const box = $("#assetCards");

        if (!box) return;

        box.addEventListener("click", event => {

            if (event.target.closest("a")) return;

            const card = event.target.closest(".asset-card");

            if (card) abrirGrafico(card.dataset.symbol);
        });
    })();


    function renderChart(assets, current) {

        const chart = $("#distributionChart");
        const legend = $("#distributionLegend");

        if (!chart || !legend) return;

        const byCategory = {};

        assets.forEach(asset => {
            byCategory[asset.category] = (byCategory[asset.category] || 0) + asset.current;
        });

        const slices = Object.entries(byCategory)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        if (!slices.length || current <= 0) {
            chart.style.background = "";
            legend.innerHTML = `<div class="legend-empty">Sem dados para exibir</div>`;
            return;
        }

        let start = 0;

        const stops = slices.map((slice, index) => {

            const color = CORES[index % CORES.length];
            const size = (slice.value / current) * 100;
            const part = `${color} ${start}% ${start + size}%`;

            start += size;
            slice.color = color;
            slice.percent = size;

            return part;
        });

        chart.style.background = `conic-gradient(${stops.join(", ")})`;

        legend.innerHTML = slices.map(slice => `
            <div>
                <span class="legend-name">
                    <span class="legend-dot" style="background:${slice.color}"></span>
                    ${escapeHtml(slice.name)}
                </span>
                <span>${percentText(slice.percent)}</span>
            </div>`).join("");
    }


    /* =====================================================
       EVENTOS
    ===================================================== */

    // Troca de aba: o carteira.js muda a carteira ativa primeiro (listener do botão),
    // este listener roda depois, na subida do evento.
    const tabs = $("#walletTabs");

    if (tabs) {
        tabs.addEventListener("click", () => setTimeout(render, 0));
    }

    // Carteira nova criada pelo botão "Nova carteira"
    window.addEventListener("carteirasAtualizadas", async () => {
        await carregarResumo();
        render();
    });


    /* =====================================================
       INICIALIZAR
    ===================================================== */

    Promise.all([Carteiras.load(), carregarResumo()]).then(() => {

        render();

        Cotacoes.watch(
            () => resumo.flatMap(w => w.ativos.map(a => a.simbolo_ativo)),
            result => {
                quotes = result;
                render();
            }
        );
    });

})();