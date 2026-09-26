<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Histórico - Accuracy</title>

<link rel="stylesheet" href="css/Tema.css">
<link rel="stylesheet" href="css/historico.css?v=3">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<script src="js/Tema.js"></script>
<script src="js/avatar-global.js"></script>
</head>

<body>

<div class="app">

    <!-- =========================
         NAVBAR SUPERIOR
    ========================== -->

    <aside class="sidebar">

        <div class="top">

            <!-- LOGO -->

            <a href="dashboard.php" class="logo">

                <div class="logo-box">
                    <i class="bi bi-graph-up"></i>
                </div>

                <span>Accuracy</span>

            </a>


            <!-- DIVISOR -->

            <div class="divider"></div>


            <!-- MENU -->

            <nav class="menu">

                <a href="dashboard.php">
                    <i class="bi bi-grid"></i>
                    <span>Dashboard</span>
                </a>

                <a href="carteira.php">
                    <i class="bi bi-wallet2"></i>
                    <span>Carteira</span>
                </a>

                <a href="historico.php" class="active">
                    <i class="bi bi-clock-history"></i>
                    <span>Histórico</span>
                </a>

                <a href="aportes.php">
                    <i class="bi bi-plus-circle"></i>
                    <span>Aportes</span>
                </a>

                <a href="#">
                    <i class="bi bi-bar-chart"></i>
                    <span>Relatórios</span>
                </a>

                <a href="Cursos.php">
                    <i class="bi bi-mortarboard"></i>
                    <span>Cursos</span>
                </a>

                <a href="perfil.php">
                    <i class="bi bi-person"></i>
                    <span>Perfil</span>
                </a>

            </nav>

        </div>


        <!-- =========================
             ÁREA DO USUÁRIO
        ========================== -->

        <div class="user-area">


            <!-- NOTIFICAÇÕES -->

            <div class="icons">

                <div class="notification-container">

                    <button
                        class="notification-btn"
                        type="button"
                        aria-label="Notificações"
                        id="notificationBtn"
                    >

                        <i class="bi bi-bell"></i>

                        <span
                            class="notification-dot"
                            id="notificationDot"
                        ></span>

                    </button>


                    <!-- =========================
                         PAINEL DE NOTIFICAÇÕES
                    ========================== -->

                    <div
                        class="notification-panel"
                        id="notificationPanel"
                    >

                        <!-- CABEÇALHO -->

                        <div class="notification-header">

                            <h3>Notificações</h3>

                            <button
                                type="button"
                                id="markRead"
                            >
                                Marcar como lidas
                            </button>

                        </div>


                        <!-- LISTA -->

                        <div class="notification-list">

                            <div class="empty-notifications">
                                <i class="bi bi-bell-slash"></i>
                                <strong>Nenhuma notificação</strong>
                                <p>Você não possui novas notificações.</p>
                            </div>

                        </div>


                        <!-- RODAPÉ -->

                        <div class="notification-footer">

                            <a href="historico.php">
                                Ver todas as notificações
                            </a>

                        </div>

                    </div>

                </div>

            </div>


            <!-- =========================
                 USUÁRIO
            ========================== -->

            <div class="user">

                <a href="perfil.php">

                    <div class="avatar">
                        N
                    </div>

                </a>

                <div class="user-info">

                    <a href="perfil.php">

                        <strong>
                            Nome da pessoa
                        </strong>

                    </a>

                    <p>
                        Perfil do usuário
                    </p>

                </div>

            </div>

        </div>

    </aside>


    <!-- MAIN -->
    <main class="main">

        <header class="topbar">
            <div>
                <h1>Histórico</h1>
                <p id="currentDate"></p>
            </div>
        </header>

        <section class="cards">
            <div class="card">
                <span>Total aportado</span>
                <h3 id="cardTotal">R$ 0,00</h3>
                <p id="cardTotalInfo">0 aportes ativos</p>
            </div>

            <div class="card green">
                <span>Aportes realizados</span>
                <h3 id="cardAdded">R$ 0,00</h3>
                <p id="cardAddedInfo">0 operações</p>
            </div>

            <div class="card red">
                <span>Aportes removidos</span>
                <h3 id="cardRemoved">R$ 0,00</h3>
                <p id="cardRemovedInfo">0 remoções</p>
            </div>

            <div class="card">
                <span>Movimentações</span>
                <h3 id="cardMoves">0</h3>
                <p id="cardMovesInfo">Nenhuma ainda</p>
            </div>
        </section>

        <section class="chart">
            <div class="chart-header">
                <h3>Aportes por mês</h3>

                <div class="chart-legend">
                    <span><i class="dot dot-green"></i>Aportado</span>
                    <span><i class="dot dot-red"></i>Removido</span>
                </div>
            </div>

            <div class="chart-box" id="chartBox">Gráfico</div>
        </section>

        <section class="table">

            <div class="table-header">
                <h3>Transações</h3>

                <div class="filters">
                    <button class="active" data-filter="all">Todos</button>
                    <button data-filter="Compra">Compra</button>
                    <button data-filter="Aporte">Aporte</button>
                    <button data-filter="removed">Removidos</button>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th>Tipo</th>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Recorrência</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody id="historyBody"></tbody>
            </table>

        </section>

    </main>

</div>


<!-- =========================
     JAVASCRIPT
========================= -->

<script>
(function () {
"use strict";

const $ = (selector) => document.querySelector(selector);

const STORAGE_KEY = "accuracy_aportes";
const HISTORY_KEY = "accuracy_historico";

let currentFilter = "all";


/* =========================
   LEITURA DO LOCALSTORAGE
========================= */

function read(key) {

    try {
        return JSON.parse(localStorage.getItem(key));
    } catch {
        return null;
    }

}


/* =========================
   APORTES ANTIGOS
   (feitos antes do histórico
   existir entram como "added")
========================= */

function seedHistory() {

    const current = read(HISTORY_KEY);

    if (Array.isArray(current) && current.length) {
        return;
    }

    const old = read(STORAGE_KEY) || [];

    if (!old.length) {
        return;
    }

    const seeded = old.map(item => ({

        id: `${item.id}-seed`,
        action: "added",
        contributionId: item.id,
        asset: item.asset,
        category: item.category,
        type: item.type,
        amount: item.amount,
        date: item.date,
        recurrence: item.recurrence,
        recurrenceDay: item.recurrenceDay,
        observation: item.observation,
        timestamp: new Date(item.id).toISOString()

    }));

    localStorage.setItem(HISTORY_KEY, JSON.stringify(seeded));

}


/* =========================
   FORMATAÇÕES
========================= */

function money(value) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);

}

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const [year, month, day] = dateString.split("-");

    return `${day}/${month}/${year}`;

}

function formatDateTime(iso) {

    return new Date(iso).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });

}

function recurrenceText(item) {

    if (item.recurrence === "weekly") {
        return "Semanal";
    }

    if (item.recurrence === "monthly") {
        return `Mensal - dia ${item.recurrenceDay}`;
    }

    return "Único";

}

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;

}

function typeClass(type) {

    if (type === "Compra") {
        return "green";
    }

    if (type === "Venda") {
        return "red";
    }

    return "blue";

}

function plural(count, singular, pluralWord) {

    return `${count} ${count === 1 ? singular : pluralWord}`;

}


/* =========================
   CARDS
========================= */

function updateCards(history) {

    const added = history.filter(e => e.action === "added");
    const removed = history.filter(e => e.action === "removed");

    const sum = list => list.reduce((total, e) => total + e.amount, 0);

    const totalAdded = sum(added);
    const totalRemoved = sum(removed);

    $("#cardTotal").textContent = money(totalAdded - totalRemoved);
    $("#cardTotalInfo").textContent =
        `${plural(added.length - removed.length, "aporte ativo", "aportes ativos")}`;

    $("#cardAdded").textContent = money(totalAdded);
    $("#cardAddedInfo").textContent = plural(added.length, "operação", "operações");

    $("#cardRemoved").textContent = money(totalRemoved);
    $("#cardRemovedInfo").textContent = plural(removed.length, "remoção", "remoções");

    $("#cardMoves").textContent = history.length;
    $("#cardMovesInfo").textContent =
        history.length ? "Adições e remoções" : "Nenhuma ainda";

}


/* =========================
   GRÁFICO (ÚLTIMOS 6 MESES)
========================= */

function renderChart(history) {

    const box = $("#chartBox");

    if (!box) {
        return;
    }

    const names = [
        "jan", "fev", "mar", "abr", "mai", "jun",
        "jul", "ago", "set", "out", "nov", "dez"
    ];

    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {

        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);

        months.push({
            key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
            label: `${names[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
            added: 0,
            removed: 0
        });

    }

    history.forEach(entry => {

        const day = entry.date || (entry.timestamp || "").slice(0, 10);

        const month = months.find(m => m.key === day.slice(0, 7));

        if (!month) {
            return;
        }

        if (entry.action === "removed") {
            month.removed += entry.amount;
        } else {
            month.added += entry.amount;
        }

    });

    const max = Math.max(...months.map(m => Math.max(m.added, m.removed)));

    if (!max) {
        box.textContent = "Nenhum aporte nos últimos 6 meses.";
        return;
    }

    const AREA = 170;

    const px = value =>
        value ? Math.max(4, Math.round(value / max * AREA)) : 0;

    const short = value => money(value).replace(",00", "");

    box.innerHTML = `
        <div class="bar-chart">
            ${months.map(m => {

                const net = m.added - m.removed;

                return `
                    <div class="bar-group">
                        <div class="bar-cols">
                            <div class="bar add"
                                 style="height:${px(m.added)}px"
                                 title="Aportado: ${money(m.added)}"></div>
                            <div class="bar rem"
                                 style="height:${px(m.removed)}px"
                                 title="Removido: ${money(m.removed)}"></div>
                        </div>
                        <span class="bar-label">${m.label}</span>
                        <small class="bar-net ${net < 0 ? "red" : "green"}">${short(net)}</small>
                    </div>
                `;

            }).join("")}
        </div>
    `;

}


/* =========================
   TABELA
========================= */

function render() {

    const history = read(HISTORY_KEY) || [];

    updateCards(history);

    renderChart(history);

    const sorted = [...history].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    const visible = sorted.filter(entry => {

        if (currentFilter === "all") {
            return true;
        }

        if (currentFilter === "removed") {
            return entry.action === "removed";
        }

        return entry.type === currentFilter;

    });

    const body = $("#historyBody");

    if (!visible.length) {

        body.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">Nenhuma movimentação encontrada.</td>
            </tr>
        `;

        return;
    }

    body.innerHTML = visible.map(entry => {

        const isRemoved = entry.action === "removed";

        const details = [
            entry.date ? `Operação de ${formatDate(entry.date)}` : "",
            entry.observation ? escapeHtml(entry.observation) : ""
        ].filter(Boolean).join(" • ");

        return `
            <tr>
                <td class="asset-cell">
                    ${escapeHtml(entry.asset)}
                    <small>${details}</small>
                </td>
                <td class="${typeClass(entry.type)}">${escapeHtml(entry.type)}</td>
                <td>${formatDateTime(entry.timestamp)}</td>
                <td class="${isRemoved ? "red" : ""}">
                    ${isRemoved ? "- " : ""}${money(entry.amount)}
                </td>
                <td>${recurrenceText(entry)}</td>
                <td>
                    <span class="status ${isRemoved ? "removed" : "done"}">
                        ${isRemoved ? "Removido" : "Concluída"}
                    </span>
                </td>
            </tr>
        `;

    }).join("");

}


/* =========================
   FILTROS
========================= */

document.querySelectorAll("[data-filter]").forEach(button => {

    button.addEventListener("click", () => {

        currentFilter = button.dataset.filter;

        document
            .querySelectorAll("[data-filter]")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");

        render();

    });

});


/* =========================
   DATA NO TOPO
========================= */

const currentDate = $("#currentDate");

if (currentDate) {

    currentDate.textContent =
        new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        });

}


/* =========================
   ATUALIZA SE OUTRA ABA
   MEXER NOS APORTES
========================= */

window.addEventListener("storage", event => {

    if (event.key === HISTORY_KEY) {
        render();
    }

});


/* =========================
   INICIALIZAÇÃO
========================= */

try {

    seedHistory();

    render();

} catch (error) {

    console.error("Erro no histórico:", error);

    const body = $("#historyBody");

    if (body) {
        body.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">Erro ao carregar o histórico: ${escapeHtml(error.message)}</td>
            </tr>
        `;
    }

}

})();
</script>

<script>

    /* =========================
       ELEMENTOS
    ========================== */

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const notificationDot =
        document.getElementById("notificationDot");

    const markRead =
        document.getElementById("markRead");


    /* =========================
       ABRIR / FECHAR PAINEL
    ========================== */

    notificationBtn.addEventListener("click", function(event) {

        event.stopPropagation();

        notificationPanel.classList.toggle("show");

    });


    /* =========================
       NÃO FECHAR AO CLICAR
       DENTRO DO PAINEL
    ========================== */

    notificationPanel.addEventListener("click", function(event) {

        event.stopPropagation();

    });


    /* =========================
       FECHAR AO CLICAR FORA
    ========================== */

    document.addEventListener("click", function() {

        notificationPanel.classList.remove("show");

    });


    /* =========================
       MARCAR COMO LIDAS
    ========================== */

    markRead.addEventListener("click", function() {

        const unreadItems =
            document.querySelectorAll(
                ".notification-item.unread"
            );


        unreadItems.forEach(function(item) {

            item.classList.remove("unread");


            const unreadDot =
                item.querySelector(".unread-dot");


            if (unreadDot) {

                unreadDot.remove();

            }

        });


        /* Remove a bolinha verde do sino */

        notificationDot.style.display = "none";

    });

</script>


</body>
</html>