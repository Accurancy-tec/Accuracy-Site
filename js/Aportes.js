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

const API_BASE_URL = "https://accuracyappapi.onrender.com";
const STORAGE_KEY = "accuracy_aportes_cache";
const HISTORY_KEY = "accuracy_historico";

let contributions =
    JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

/* Cotações atuais { PETR4: 38.5, ... } (vem de js/cotacoes.js) */
let quotes = {};


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
                    /^\d+$/.test(String(item.id))
                        ? new Date(Number(item.id)).toISOString()
                        : new Date().toISOString()
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
   API
========================= */

function getToken() {

    return localStorage.getItem("token");

}


async function cadastrarAporteAPI(dados) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}/user/aportes.php`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(dados)
        }
    );

    const text = await response.text();

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(
            `A API retornou uma resposta inválida (HTTP ${response.status}).`
        );
    }

    if (response.status === 401) {

        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        setTimeout(() => {
            window.location.href = "login.php";
        }, 1500);

        throw new Error(
            "Sessão expirada. Faça login novamente."
        );

    }

    if (!response.ok || data.sucesso !== true) {
        throw new Error(
            data.mensagem ||
            data.message ||
            `Erro HTTP ${response.status}.`
        );
    }

    return data;

}


/* =========================
   SALVAR CACHE DA TELA
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
        console.log("=== DEBUG CARTEIRA ===");
        console.log("Carteiras.list():", Carteiras.list());
        console.log("Carteira ativa:", Carteiras.getActive());
        let walletId = null;

        if (typeof Carteiras !== "undefined") {
            await Carteiras.load();

            const carteiras = Carteiras.list();

            console.log("Carteiras disponíveis:", carteiras);

            if (!carteiras || carteiras.length === 0) {

                toast("Nenhuma carteira encontrada.");

                return;
            }

            /*
             * Se houver apenas uma carteira,
             * usa diretamente o ID dela.
             */
            if (carteiras.length === 1) {
                walletId = carteiras[0].id;
            }

            else {

                /*
                 * Se houver mais de uma carteira,
                 * abre o seletor.
                 */

                const active = Carteiras.getActive();

                const chosen = await Carteiras.askWallet({
                    selected:
                        active === "all"
                            ? Carteiras.MAIN_ID
                            : active
                });

                if (!chosen) {
                    return;
                }

                walletId = chosen;
            }

        }


        /*
         * Garante que o ID enviado para a API
         * seja realmente numérico.
         */

        walletId = Number(walletId);


        if (!Number.isInteger(walletId) || walletId <= 0) {

            console.error(
                "ID da carteira inválido:",
                walletId
            );

            toast(
                "Não foi possível identificar a carteira selecionada."
            );

            return;
        }


        console.log(
            "ID DA CARTEIRA QUE SERÁ ENVIADO PARA A API:",
            walletId
        );


        /* Cotação no momento da compra */
        let buyQuote = {};

        try {

            if (
                typeof Cotacoes !== "undefined" &&
                typeof Cotacoes.fetch === "function"
            ) {

                buyQuote =
                    await Cotacoes.fetch([
                        asset.value
                    ]);

            }

        } catch (error) {

            console.error(
                "Erro ao buscar cotação:",
                error
            );

        }


        /* Ativos que não têm cotação (CDB, Outro) são salvos mesmo assim */
        const SEM_COTACAO = ["CDB Nubank", "Outro"];

        let unitPrice =
            buyQuote[asset.value] ?? null;

        if (
            !unitPrice ||
            Number(unitPrice) <= 0
        ) {

            if (SEM_COTACAO.includes(asset.value)) {

                unitPrice = null;

            } else {

                toast(
                    "Não foi possível obter a cotação do ativo. O aporte não foi salvo."
                );

                return;

            }

        }


        /* Sem cotação: 1 unidade = R$ 1,00 */
        const quantity =
            unitPrice
                ? value / Number(unitPrice)
                : value;


        const selectedOption =
            asset.options[
            asset.selectedIndex
            ];


        const nameAsset =
            selectedOption
                ? selectedOption.textContent
                    .split("—")[0]
                    .trim()
                : asset.value;


        /*
         * Dados enviados para a API hospedada.
         */

        const recorrenciaAPI = {

            none: "Único",

            weekly: "Semanal",

            monthly: "Mensal"

        };


        const dadosAPI = {
            id_carteira: Number(walletId),

            ativo_aporte: asset.value,
            name_ativo: nameAsset,
            categoria_ativo: classOf(asset.value),

            tipo_aporte: type.value,

            quantidade_aporte: quantity,
            valor_aporte: value,

            data_aporte: date.value,

            recorrencia_aporte:
                recorrenciaAPI[recurrence.value] || "Único",

            observacao_aporte:
                observation.value.trim()
        };

        console.log(
            "Enviando aporte para a API:",
            dadosAPI
        );


        try {

            /*
             * PRIMEIRO salva no banco.
             */

            const resultado =
                await cadastrarAporteAPI(
                    dadosAPI
                );


            console.log(
                "Aporte salvo na API:",
                resultado
            );


            /*
             * O endpoint atual não devolve
             * o id_aporte.
             *
             * Criamos um identificador local
             * apenas para controlar a interface.
             */

            const contribution = {

                id:
                    `local-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 7)}`,

                unitPrice,

                asset:
                    asset.value,

                category:
                    classOf(asset.value),

                walletId,

                amount:
                    value,

                type:
                    type.value,

                date:
                    date.value,

                recurrence:
                    recurrence.value,

                recurrenceDay:
                    recurrenceDay.value || null,

                observation:
                    observation.value.trim(),

                active:
                    true

            };


            contributions.push(
                contribution
            );


            logHistory(
                "added",
                contribution
            );


            /*
             * Guarda apenas o cache da interface.
             * O cadastro real já foi feito na API.
             */

            save();


            render();


            clearForm();


            /*
             * MANTÉM A ANIMAÇÃO ORIGINAL
             */

            moneyRain();


            /*
             * MANTÉM A NOTIFICAÇÃO ORIGINAL
             */

            toast(
                "Aporte feito com sucesso!"
            );


        } catch (error) {

            console.error(
                "Erro ao salvar aporte:",
                error
            );


            toast(
                error.message ||
                "Não foi possível salvar o aporte."
            );

        }

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
   COTAÇÃO DO ATIVO
========================= */

function updateAssetPrice() {

    const box = $("#assetPrice");

    const price = quotes[asset.value];

    box.className = "asset-price";

    box.textContent = price
        ? `Cotação atual: ${money(price)}`
        : "";

}


/* Quanto o aporte vale hoje */
function nowInfo(item) {

    const price = quotes[item.asset];

    if (!price) {
        return "";
    }

    if (!item.unitPrice) {
        return `<span class="aporte-now">Cotação: ${money(price)}</span>`;
    }

    const value =
        (item.amount / item.unitPrice) *
        price;

    const diff =
        value -
        item.amount;

    const pct =
        (diff / item.amount) *
        100;

    const sign =
        diff >= 0
            ? "+"
            : "";

    return `<span class="aporte-now ${diff >= 0 ? "up" : "down"}">
        Hoje: ${money(value)} (${sign}${pct
            .toFixed(2)
            .replace(".", ",")}%)
        • Cotação: ${money(price)}
    </span>`;

}


asset.addEventListener(
    "change",
    () => {

        if (
            typeof Cotacoes === "undefined"
        ) {

            updateAssetPrice();

            return;

        }


        Cotacoes
            .fetch([asset.value])
            .then(q => {

                Object.assign(
                    quotes,
                    q
                );

                updateAssetPrice();

            });


        updateAssetPrice();

    }
);


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
                        ${item.observation
                ? ` • ${item.observation}`
                : ""
            }
                    </small>

                </div>

            </div>


            <div class="right">

                <div>

                    <strong class="aporte-value">
                        ${money(item.amount)}
                    </strong>

                    ${nowInfo(item)}

                </div>


                ${item.recurrence !== "none"

                ?

                `
                    <label
                        class="switch"
                        title="Ativar/desativar recorrência"
                    >

                        <input
                            type="checkbox"
                            data-id="${String(item.id)}"
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
                    data-delete="${String(item.id)}"
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
        `${contributions.length} ${contributions.length === 1
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
            event.target.dataset.id;


        const item =
            contributions.find(
                contribution =>
                    String(contribution.id) ===
                    String(id)
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
            button.dataset.delete;


        const item =
            contributions.find(
                contribution =>
                    String(contribution.id) ===
                    String(id)
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
                    String(contribution.id) !==
                    String(id)
            );


        logHistory(
            "removed",
            item
        );


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


        contributions.forEach(
            item => {

                logHistory(
                    "removed",
                    item
                );

            }
        );


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
        contributions.filter(
            item => {

                const d =
                    new Date(
                        item.date +
                        "T00:00:00"
                    );


                return (
                    d.getMonth() ===
                    month &&

                    d.getFullYear() ===
                    year
                );

            }
        );


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
                item.recurrence !==
                "none" &&

                item.active
        );


    activeRecurring.textContent =
        `${recurring.length} ${recurring.length === 1
            ? "ativo"
            : "ativos"
        }`;


    /*
       Média
    */

    const values =
        contributions.map(
            item =>
                item.amount
        );


    const average =
        values.length

            ? values.reduce(
                (a, b) =>
                    a + b,
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

    } else if (
        recurring.length
    ) {

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


/* Busca as cotações agora
   e a cada 60s */

if (
    typeof Cotacoes !==
    "undefined"
) {

    Cotacoes.watch(

        () => [
            asset.value,
            ...contributions.map(
                item =>
                    item.asset
            )
        ],

        result => {

            quotes =
                result;

            updateAssetPrice();

            render();

        }

    );

}