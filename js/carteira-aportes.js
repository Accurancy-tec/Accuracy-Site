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