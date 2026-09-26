(function () {
"use strict";

/* Se o carteiras.js não carregou, avisa na própria página */

if (typeof Carteiras === "undefined") {

    console.error(
        "Carteiras não foi carregado. Confira se js/carteiras.js existe, " +
        "está completo (sem estar vazio ou duplicado) e foi salvo."
    );

    const bar = document.getElementById("walletTabs");

    if (bar) {
        bar.textContent =
            "Erro: o arquivo js/carteiras.js não foi carregado corretamente (veja o Console, F12).";
        bar.style.color = "var(--vermelho)";
        bar.style.fontSize = "13px";
    }

    return;

}

const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "accuracy_aportes";

/* Cores iguais às dos ícones da página de Aportes */

const COLORS = {
    "Ações": "#22c55e",
    "Cripto": "#f97316",
    "Renda Fixa": "#06b6d4",
    "FIIs": "#eab308",
    "Outros": "#3b82f6"
};

const CLASS_OF = {
    PETR4: "Ações",
    Bitcoin: "Cripto",
    "CDB Nubank": "Renda Fixa",
    XPML11: "FIIs"
};


/* =========================
   AUXILIARES
========================= */

function money(value) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);

}

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;

}

function plural(count, singular, pluralWord) {

    return `${count} ${count === 1 ? singular : pluralWord}`;

}

function percent(value, total) {

    const number = total ? (value / total) * 100 : 0;

    return `${number.toFixed(1).replace(".", ",")}%`;

}

function readContributions() {

    try {
        const list = JSON.parse(localStorage.getItem(STORAGE_KEY));
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }

}

/* Com só a carteira principal, não há o que alternar */

function effectiveActive() {

    return Carteiras.list().length === 1
        ? Carteiras.MAIN_ID
        : Carteiras.getActive();

}

function contributionsOf(walletId) {

    const all = readContributions();

    if (walletId === "all") {
        return all;
    }

    return all.filter(
        item => Carteiras.normalize(item.walletId) === walletId
    );

}


/* =========================
   ABAS DAS CARTEIRAS
========================= */

function renderTabs(active) {

    const wallets = Carteiras.list();

    const items = wallets.length > 1
        ? [{ id: "all", name: "Todas" }, ...wallets]
        : wallets;

    const tabs = $("#walletTabs");

    tabs.innerHTML = "";

    items.forEach(wallet => {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "wallet-tab" + (wallet.id === active ? " active" : "");
        button.textContent = wallet.name;

        button.addEventListener("click", () => {
            Carteiras.setActive(wallet.id);
            render();
        });

        tabs.appendChild(button);

    });

    const deleteBtn = $("#deleteWalletBtn");

    const custom = active !== "all" && active !== Carteiras.MAIN_ID;

    deleteBtn.hidden = !custom;

    if (custom) {

        const hasContributions = contributionsOf(active).length > 0;

        deleteBtn.disabled = hasContributions;

        deleteBtn.title = hasContributions
            ? "Só é possível excluir carteiras sem aportes."
            : "Excluir esta carteira";

    }

}


/* =========================
   RENDERIZAR
========================= */

function render() {

    const active = effectiveActive();

    renderTabs(active);

    const items = contributionsOf(active);

    const total = items.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
    );

    $("#totalEquity").textContent = money(total);
    $("#totalInvested").textContent = money(total);

    $("#equityHint").textContent = active === "all"
        ? "Soma dos aportes de todas as carteiras"
        : `Soma dos aportes • ${Carteiras.nameOf(active)}`;


    /* Agrupa por ativo e por classe */

    const assets = {};
    const classes = {};

    items.forEach(item => {

        const category = item.category || CLASS_OF[item.asset] || "Outros";

        const value = Number(item.amount) || 0;

        const asset = assets[item.asset] || (assets[item.asset] = {
            name: item.asset,
            category,
            count: 0,
            total: 0
        });

        asset.count++;
        asset.total += value;

        classes[category] = (classes[category] || 0) + value;

    });

    const rows = Object.values(assets).sort((a, b) => b.total - a.total);


    /* Tabela */

    $("#assetsCount").textContent = plural(rows.length, "ativo", "ativos");

    $("#assetsBody").innerHTML = rows.length
        ? rows.map(asset => `
            <tr>
                <td>${escapeHtml(asset.name)}</td>
                <td>${escapeHtml(asset.category)}</td>
                <td>${asset.count}</td>
                <td>${money(asset.total)}</td>
                <td>${percent(asset.total, total)}</td>
            </tr>
        `).join("")
        : `<tr><td colspan="5" class="table-empty">Nenhum investimento nesta carteira.</td></tr>`;


    /* Gráfico de distribuição */

    const circle = $("#distributionChart");
    const legend = $("#distributionLegend");

    if (!total) {

        circle.style.background = "";

        legend.innerHTML = `<p class="legend-empty">Sem dados para exibir.</p>`;

        return;

    }

    const entries = Object.entries(classes).sort((a, b) => b[1] - a[1]);

    let accumulated = 0;

    const stops = entries.map(([category, value]) => {

        const start = (accumulated / total) * 100;

        accumulated += value;

        const end = (accumulated / total) * 100;

        return `${COLORS[category] || COLORS.Outros} ${start}% ${end}%`;

    });

    circle.style.background = `conic-gradient(${stops.join(", ")})`;

    legend.innerHTML = entries.map(([category, value]) => `
        <div>
            <span class="legend-name">
                <span class="legend-dot" style="background:${COLORS[category] || COLORS.Outros}"></span>
                ${escapeHtml(category)}
            </span>
            <span>${percent(value, total)}</span>
        </div>
    `).join("");

}


/* =========================
   NOVA CARTEIRA / EXCLUIR
========================= */

$("#newWalletBtn").addEventListener("click", async () => {

    const wallet = await Carteiras.promptNewWallet();

    if (wallet) {

        Carteiras.setActive(wallet.id);

        render();

    }

});

$("#deleteWalletBtn").addEventListener("click", () => {

    const id = Carteiras.getActive();

    if (id === "all" || id === Carteiras.MAIN_ID) {
        return;
    }

    if (!confirm(`Excluir a carteira "${Carteiras.nameOf(id)}"?`)) {
        return;
    }

    Carteiras.remove(id);

    render();

});


/* =========================
   DATA NO TOPO
========================= */

$("#currentDate").textContent =
    new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
    });


/* =========================
   ATUALIZA SE OUTRA ABA MEXER
========================= */

window.addEventListener("storage", event => {

    if (
        event.key === STORAGE_KEY ||
        event.key === "accuracy_carteiras"
    ) {
        render();
    }

});


render();

})();