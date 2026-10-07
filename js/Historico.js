/* =========================================================
   HISTÓRICO - dados vindos da API (sem localStorage)

   Usa a rota GET /aportes/historico-aportes, a mesma que o
   dashboard já usa. O token de login continua no localStorage
   (é ele que identifica o usuário), mas o histórico em si
   agora vem do banco e aparece em qualquer navegador.
========================================================= */

(function () {

    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    const $ = (selector) => document.querySelector(selector);

    let history = [];
    let currentFilter = "all";


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

        const [year, month, day] = String(dateString).slice(0, 10).split("-");

        return `${day}/${month}/${year}`;
    }

    function recurrenceText(item) {

        if (item.recurrence === "Semanal") {
            return "Semanal";
        }

        if (item.recurrence === "Mensal") {
            return "Mensal";
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
       BUSCAR NA API
    ========================= */

    async function carregarHistoricoAPI() {

        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.php";
            return [];
        }

        const response = await fetch(
            `${API_BASE_URL}/aportes/historico-aportes`,
            {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (response.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("usuario");

            window.location.href = "login.php";

            return [];
        }

        const data = await response.json();

        if (!response.ok || data.sucesso !== true) {
            throw new Error(
                data.mensagem || data.message || `Erro HTTP ${response.status}.`
            );
        }

        /*
         * Converte para o formato usado nas telas.
         * Se a API passar a devolver "removido_em",
         * o aporte já aparece como removido.
         */
        return (data.aportes || []).map(item => ({

            id: item.id_aporte,
            action: item.removido_em ? "removed" : "added",
            asset: item.ativo_aporte,
            type: item.tipo_aporte,
            amount: Number(item.valor_aporte) || 0,
            date: item.data_aporte ? String(item.data_aporte).slice(0, 10) : "",
            recurrence: item.recorrencia_aporte,
            observation: item.observacao_aporte || ""
        }));
    }


    /* =========================
       CARDS
    ========================= */

    function updateCards() {

        const added = history.filter(e => e.action === "added");
        const removed = history.filter(e => e.action === "removed");

        const sum = list => list.reduce((total, e) => total + e.amount, 0);

        const totalAdded = sum(added);
        const totalRemoved = sum(removed);

        $("#cardTotal").textContent = money(totalAdded);
        $("#cardTotalInfo").textContent =
            plural(added.length, "aporte ativo", "aportes ativos");

        $("#cardAdded").textContent = money(totalAdded + totalRemoved);
        $("#cardAddedInfo").textContent =
            plural(added.length + removed.length, "operação", "operações");

        $("#cardRemoved").textContent = money(totalRemoved);
        $("#cardRemovedInfo").textContent =
            plural(removed.length, "remoção", "remoções");

        $("#cardMoves").textContent = history.length;
        $("#cardMovesInfo").textContent =
            history.length ? "Aportes e remoções" : "Nenhuma ainda";
    }


    /* =========================
       GRÁFICO (ÚLTIMOS 6 MESES)
    ========================= */

    function renderChart() {

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

            const month = months.find(m => m.key === entry.date.slice(0, 7));

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

    function renderTable() {

        const sorted = [...history].sort((a, b) =>
            b.date.localeCompare(a.date) || Number(b.id) - Number(a.id)
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

            return `
                <tr>
                    <td class="asset-cell">
                        ${escapeHtml(entry.asset)}
                        <small>${entry.observation ? escapeHtml(entry.observation) : ""}</small>
                    </td>
                    <td class="${typeClass(entry.type)}">${escapeHtml(entry.type)}</td>
                    <td>${formatDate(entry.date)}</td>
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


    function render() {

        updateCards();
        renderChart();
        renderTable();
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

            renderTable();
        });
    });


    /* =========================
       INICIALIZAÇÃO
    ========================= */

    const body = $("#historyBody");

    if (body) {

        body.innerHTML = `
            <tr class="empty-row">
                <td colspan="6">Carregando histórico...</td>
            </tr>
        `;
    }

    carregarHistoricoAPI()
        .then(lista => {

            history = lista

            render();
        })
        .catch(error => {

            console.error("Erro no histórico:", error);

            if (body) {

                body.innerHTML = `
                    <tr class="empty-row">
                        <td colspan="6">Erro ao carregar o histórico: ${escapeHtml(error.message)}</td>
                    </tr>
                `;
            }
        });

})();