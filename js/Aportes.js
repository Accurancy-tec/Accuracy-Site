const $ = (selector) => document.querySelector(selector);

const amount = $("#amount");
const asset = $("#asset");
const type = $("#type");
const date = $("#date");
const recurrence = $("#recurrence");
const recurrenceDay = $("#recurrenceDay");
const recurrenceDayBox = $("#recurrenceDayBox");
const observation = $("#observation");

const contributionList = $("#contributionList");
const emptyState = $("#emptyState");

const totalMonth = $("#totalMonth");
const activeRecurring = $("#activeRecurring");
const contributionCount = $("#contributionCount");
const monthlyAverage = $("#monthlyAverage");
const nextContribution = $("#nextContribution");

const STORAGE_KEY = "accuracy_aportes";
const HISTORY_KEY = "accuracy_historico";

let contributions =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];


/* =========================
   HISTÓRICO
   (registra cada aporte
   adicionado ou removido)
========================= */

function historyEntry(action, item, timestamp = new Date().toISOString()) {

    return {

        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

        action,

        contributionId: item.id,

        asset: item.asset,

        category: item.category,

        type: item.type,

        amount: item.amount,

        date: item.date,

        recurrence: item.recurrence,

        recurrenceDay: item.recurrenceDay,

        observation: item.observation,

        timestamp

    };

}


function logHistory(action, item) {

    let history;

    try {
        history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        history = [];
    }

    history.push(historyEntry(action, item));

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );

}


/* Aportes que já existiam antes do histórico */

if (
    localStorage.getItem(HISTORY_KEY) === null &&
    contributions.length
) {

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(
            contributions.map(item =>
                historyEntry(
                    "added",
                    item,
                    new Date(item.id).toISOString()
                )
            )
        )
    );

}


/* =========================
   CLASSE DE CADA ATIVO
   (usado pelo gráfico de
   distribuição da Carteira)
========================= */

const ASSET_CLASS = {

    PETR4: "Ações",

    Bitcoin: "Cripto",

    "CDB Nubank": "Renda Fixa",

    XPML11: "FIIs"

};


function classOf(assetName) {

    return ASSET_CLASS[assetName] || "Outros";

}


/* =========================
   FORMATAÇÃO DE DINHEIRO
========================= */

function money(value) {

    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL"
    }).format(value);

}


/* =========================
   PEGAR VALOR DO INPUT
========================= */

function getAmount() {

    return Number(
        amount.value
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    ) || 0;

}


/* =========================
   SALVAR
========================= */

function save() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(contributions)
    );

}


/* =========================
   NOTIFICAÇÃO
========================= */

function toast(message) {

    const box = $("#toast");
    const text = $("#toastMessage");

    text.textContent = message;

    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 2500);

}


/* =========================
   CHUVA DE DINHEIRO
   (animação ao confirmar
   um aporte)
========================= */

function randomBetween(min, max) {

    return Math.random() * (max - min) + min;

}


function moneyRain(count = 26) {

    const container = document.createElement("div");

    container.className = "money-rain";

    document.body.appendChild(container);


    for (let i = 0; i < count; i++) {

        const note = document.createElement("div");

        note.className = "money-note";

        note.textContent = "R$";


        const left = randomBetween(0, 100);

        const duration = randomBetween(2.2, 3.6);

        const delay = randomBetween(0, 0.5);

        const drift = randomBetween(-120, 120);

        const rotateStart = randomBetween(-40, 40);

        const rotateEnd = randomBetween(180, 540);

        const size = randomBetween(0.8, 1.3);


        note.style.left = `${left}vw`;

        note.style.animationDuration = `${duration}s`;

        note.style.animationDelay = `${delay}s`;

        note.style.setProperty("--drift", `${drift}px`);

        note.style.setProperty("--rot-start", `${rotateStart}deg`);

        note.style.setProperty("--rot-end", `${rotateEnd}deg`);

        note.style.transform = `scale(${size})`;


        container.appendChild(note);

    }


    const cleanupDelay = 4200;

    setTimeout(() => {

        container.remove();

    }, cleanupDelay);

}


/* =========================
   DATA DE HOJE
========================= */

function today() {

    const d = new Date();

    return `${d.getFullYear()}-${String(
        d.getMonth() + 1
    ).padStart(2, "0")}-${String(
        d.getDate()
    ).padStart(2, "0")}`;

}


date.value = today();


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
   VALORES RÁPIDOS
========================= */

document.querySelectorAll("[data-value]")
    .forEach(button => {

        button.addEventListener("click", () => {

            const value =
                Number(button.dataset.value);

            amount.value = money(value);

            document
                .querySelectorAll("[data-value]")
                .forEach(btn =>
                    btn.classList.remove("selected")
                );

            button.classList.add("selected");

        });

    });


/* =========================
   OUTRO VALOR
========================= */

$("#otherValue").addEventListener(
    "click",
    () => {

        amount.focus();
        amount.select();

        document
            .querySelectorAll("[data-value]")
            .forEach(btn =>
                btn.classList.remove("selected")
            );

    }
);


/* =========================
   FORMATAÇÃO DO VALOR
========================= */

amount.addEventListener("input", () => {

    let value =
        amount.value.replace(/\D/g, "");

    if (!value) {

        amount.value = "";

        return;
    }

    amount.value =
        money(Number(value) / 100);

});


/* =========================
   RECORRÊNCIA
========================= */

recurrence.addEventListener(
    "change",
    () => {

        const isRecurring =
            recurrence.value !== "none";

        recurrenceDayBox.classList.toggle(
            "hidden",
            !isRecurring
        );

        if (!isRecurring) {
            recurrenceDay.value = "";
        }

    }
);


/* =========================
   ADICIONAR APORTE
========================= */

$("#confirmBtn").addEventListener(
    "click",
    async () => {

        const value = getAmount();


        if (value <= 0) {

            toast(
                "Digite um valor válido."
            );

            amount.focus();

            return;
        }


        if (!date.value) {

            toast(
                "Selecione uma data."
            );

            return;
        }


        if (
            recurrence.value !== "none" &&
            (
                !recurrenceDay.value ||
                recurrenceDay.value < 1 ||
                recurrenceDay.value > 31
            )
        ) {

            toast(
                "Informe o dia da recorrência."
            );

            recurrenceDay.focus();

            return;
        }


        /*
           Se existir mais de uma carteira,
           pergunta em qual colocar o aporte
        */

        let walletId = "principal";

        if (typeof Carteiras !== "undefined") {

            walletId = Carteiras.MAIN_ID;

            if (Carteiras.list().length > 1) {

                const active = Carteiras.getActive();

                const chosen = await Carteiras.askWallet({
                    selected: active === "all" ? Carteiras.MAIN_ID : active
                });

                if (!chosen) {
                    return;
                }

                walletId = chosen;

            }

        }


        const contribution = {

            id: Date.now(),

            asset: asset.value,

            category: classOf(asset.value),

            walletId,

            amount: value,

            type: type.value,

            date: date.value,

            recurrence: recurrence.value,

            recurrenceDay:
                recurrenceDay.value || null,

            observation:
                observation.value.trim(),

            active: true

        };


        contributions.push(contribution);

        logHistory("added", contribution);

        save();

        render();

        clearForm();

        moneyRain();

        toast(
            "Aporte adicionado com sucesso!"
        );

    }
);


/* =========================
   LIMPAR FORMULÁRIO
========================= */

function clearForm() {

    observation.value = "";

    recurrence.value = "none";

    recurrenceDay.value = "";

    recurrenceDayBox.classList.add(
        "hidden"
    );

    document
        .querySelectorAll("[data-value]")
        .forEach(btn =>
            btn.classList.remove("selected")
        );

}


/* =========================
   ÍCONE DO ATIVO
========================= */

function assetIcon(name) {

    const icons = {

        PETR4: ["P4", "green-bg"],

        Bitcoin: ["₿", "orange-bg"],

        "CDB Nubank": ["CDB", "cyan-bg"],

        XPML11: ["FII", "yellow-bg"]

    };


    return (
        icons[name] ||
        ["AT", "blue-bg"]
    );

}


/* =========================
   FORMATAR DATA
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const [year, month, day] =
        dateString.split("-");

    return `${day}/${month}/${year}`;

}


/* =========================
   TEXTO DA RECORRÊNCIA
========================= */

function recurrenceText(item) {

    if (item.recurrence === "weekly") {

        return "Semanal";

    }


    if (item.recurrence === "monthly") {

        return `Mensal - dia ${item.recurrenceDay}`;

    }


    return "Único";

}


/* =========================
   NOME DA CARTEIRA NA LISTA
========================= */

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text ?? "";

    return div.innerHTML;

}


function walletLabel(item) {

    if (
        typeof Carteiras === "undefined" ||
        Carteiras.list().length < 2
    ) {
        return "";
    }

    const name = Carteiras.nameOf(
        Carteiras.normalize(item.walletId)
    );

    return ` • ${escapeHtml(name)}`;

}


/* =========================
   RENDERIZAR APORTES
========================= */

function render() {

    contributionList.innerHTML = "";


    if (contributions.length === 0) {

        emptyState.style.display =
            "block";

        contributionCount.textContent =
            "0 aportes";

        updateCards();

        return;
    }


    emptyState.style.display =
        "none";


    /*
       Mostra o mais recente
       primeiro
    */

    const sorted =
        [...contributions].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    sorted.forEach(item => {

        const [icon, color] =
            assetIcon(item.asset);


        const element =
            document.createElement("div");


        element.className =
            "aporte-item";


        element.innerHTML = `

            <div class="left">

                <div class="asset-icon ${color}">
                    ${icon}
                </div>


                <div class="aporte-info">

                    <strong>
                        ${item.asset}
                    </strong>

                    <p>
                        ${item.type}
                        • ${formatDate(item.date)}${walletLabel(item)}
                    </p>

                    <small>
                        ${recurrenceText(item)}
                        ${
                            item.observation
                                ? ` • ${item.observation}`
                                : ""
                        }
                    </small>

                </div>

            </div>


            <div class="right">

                <strong class="aporte-value">
                    ${money(item.amount)}
                </strong>


                ${
                    item.recurrence !== "none"

                    ?

                    `
                    <label
                        class="switch"
                        title="Ativar/desativar recorrência"
                    >

                        <input
                            type="checkbox"
                            data-id="${item.id}"
                            ${item.active ? "checked" : ""}
                        >

                        <span></span>

                    </label>
                    `

                    :

                    ""
                }


                <button
                    class="delete-btn"
                    data-delete="${item.id}"
                    title="Excluir aporte"
                >

                    <i class="bi bi-trash"></i>

                </button>

            </div>

        `;


        contributionList.appendChild(
            element
        );

    });


    contributionCount.textContent =
        `${contributions.length} ${
            contributions.length === 1
                ? "aporte"
                : "aportes"
        }`;


    updateCards();

}


/* =========================
   ATIVAR / DESATIVAR
========================= */

contributionList.addEventListener(
    "change",
    event => {

        if (
            event.target.type !==
            "checkbox"
        ) {
            return;
        }


        const id =
            Number(
                event.target.dataset.id
            );


        const item =
            contributions.find(
                contribution =>
                    contribution.id === id
            );


        if (!item) {
            return;
        }


        item.active =
            event.target.checked;


        save();

        updateCards();

        toast(
            item.active
                ? "Aporte recorrente ativado."
                : "Aporte recorrente desativado."
        );

    }
);


/* =========================
   EXCLUIR
========================= */

contributionList.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-delete]"
            );


        if (!button) {
            return;
        }


        const id =
            Number(
                button.dataset.delete
            );


        const item =
            contributions.find(
                contribution =>
                    contribution.id === id
            );


        if (!item) {
            return;
        }


        const confirmed =
            confirm(
                `Excluir o aporte de ${money(
                    item.amount
                )} em ${item.asset}?`
            );


        if (!confirmed) {
            return;
        }


        contributions =
            contributions.filter(
                contribution =>
                    contribution.id !== id
            );


        logHistory("removed", item);

        save();

        render();

        toast(
            "Aporte excluído."
        );

    }
);


/* =========================
   EXCLUIR TODOS OS APORTES
========================= */

$("#clearAllBtn").addEventListener(
    "click",
    () => {

        if (contributions.length === 0) {

            toast(
                "Não há aportes para excluir."
            );

            return;
        }


        const confirmed =
            confirm(
                `Tem certeza que deseja excluir todos os ${contributions.length} aportes? Essa ação não pode ser desfeita.`
            );


        if (!confirmed) {
            return;
        }


        contributions.forEach(item => {
            logHistory("removed", item);
        });


        contributions = [];

        save();

        render();

        toast(
            "Todos os aportes foram excluídos."
        );

    }
);


/* =========================
   ATUALIZAR CARDS
========================= */

function updateCards() {

    const now =
        new Date();


    const month =
        now.getMonth();


    const year =
        now.getFullYear();


    /*
       Aportes realizados
       neste mês
    */

    const monthContributions =
        contributions.filter(item => {

            const d =
                new Date(
                    item.date +
                    "T00:00:00"
                );


            return (
                d.getMonth() === month &&
                d.getFullYear() === year
            );

        });


    const total =
        monthContributions.reduce(
            (sum, item) =>
                sum + item.amount,
            0
        );


    totalMonth.textContent =
        money(total);


    /*
       Aportes recorrentes ativos
    */

    const recurring =
        contributions.filter(
            item =>
                item.recurrence !== "none" &&
                item.active
        );


    activeRecurring.textContent =
        `${recurring.length} ${
            recurring.length === 1
                ? "ativo"
                : "ativos"
        }`;


    /*
       Média
    */

    const values =
        contributions.map(
            item => item.amount
        );


    const average =
        values.length
            ? values.reduce(
                (a, b) => a + b,
                0
            ) / values.length
            : 0;


    monthlyAverage.textContent =
        money(average);


    /*
       Próximo aporte
    */

    const monthly =
        recurring.find(
            item =>
                item.recurrence ===
                "monthly"
        );


    if (monthly) {

        nextContribution.textContent =
            `Próximo: dia ${monthly.recurrenceDay}`;

    } else if (recurring.length) {

        nextContribution.textContent =
            "Próximo aporte programado";

    } else {

        nextContribution.textContent =
            "Nenhum aporte programado";

    }

}


/* =========================
   NOTIFICAÇÃO
========================= */

$("#notificationBtn").addEventListener(
    "click",
    () => {

        toast(
            "Você não possui novas notificações."
        );

    }
);


/* =========================
   INICIALIZAÇÃO
========================= */

render();