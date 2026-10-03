(function () {

    "use strict";

    let resumo = [];
    let quotes = {};


    /* =====================================================
       ELEMENTOS DO CARD PRINCIPAL
       (o HTML não tem ids, então usamos a estrutura)
    ===================================================== */

    function elements() {

        const stats = document.querySelectorAll(".card-big .stats > div strong");

        return {
            total: document.querySelector(".card-big h2"),
            invested: stats[0],
            free: stats[1],
            yieldValue: stats[2],
            badge: document.querySelector(".card-big .badge")
        };
    }


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
        return (Number(value) || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        });
    }


    /* =====================================================
       CÁLCULO
    ===================================================== */

    function totals() {

        let invested = 0;
        let current = 0;
        let free = 0;

        resumo.forEach(wallet => {

            free += Number(wallet.saldo_livre_carteira) || 0;

            wallet.ativos.forEach(item => {

                const cost = item.quantidade_item * item.preco_medio_item;
                const quote = quotes[item.simbolo_ativo];

                invested += cost;

                current += (quote !== undefined && quote !== null)
                    ? item.quantidade_item * Number(quote)
                    : cost;
            });
        });

        return {
            invested,
            free,
            current,
            total: current + free,
            yieldValue: current - invested,
            yieldPercent: invested > 0 ? ((current - invested) / invested) * 100 : 0
        };
    }


    /* =====================================================
       RENDERIZAR
    ===================================================== */

    function render() {

        const el = elements();
        const t = totals();

        if (el.total) el.total.textContent = money(t.total);
        if (el.invested) el.invested.textContent = money(t.invested);
        if (el.free) el.free.textContent = money(t.free);

        if (el.yieldValue) {

            const sign = t.yieldValue > 0 ? "+" : "";

            el.yieldValue.textContent = `${sign}${money(t.yieldValue)}`;
            el.yieldValue.classList.toggle("green", t.yieldValue >= 0);
            el.yieldValue.classList.toggle("red", t.yieldValue < 0);
        }

        if (el.badge) {

            const arrow = t.yieldValue < 0 ? "▼" : "▲";
            const sign = t.yieldValue > 0 ? "+" : "";

            el.badge.textContent = `${arrow} ${sign}${percentText(t.yieldPercent)}% total`;
        }
    }


    /* =====================================================
       BUSCAR NO BANCO
    ===================================================== */

    async function carregarResumo() {

        resumo = await ResumoCarteiras.load();
    }


    /* =====================================================
       INICIALIZAR
    ===================================================== */

    // Tira os valores de exemplo do HTML enquanto os dados reais chegam
    render();

    carregarResumo().then(() => {

        render();

        if (typeof Cotacoes !== "undefined" && typeof Cotacoes.watch === "function") {

            Cotacoes.watch(
                () => resumo.flatMap(w => w.ativos.map(a => a.simbolo_ativo)),
                result => {
                    quotes = result;
                    render();
                }
            );
        }
    });

})();