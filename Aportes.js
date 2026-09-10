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

let contributions =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];


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
    () => {

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


        const contribution = {

            id: Date.now(),

            asset: asset.value,

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

        save();

        render();

        clearForm();

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
   RENDERIZAR APORTES
========================= */

function render() {

    contributionList.innerHTML = "";


    if (contributions.length === 0) {

        emptyState.style.display =
            "block";

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
                        • ${formatDate(item.date)}
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


        save();

        render();

        toast(
            "Aporte excluído."
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