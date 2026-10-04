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

let contributions = [];

/* Cotações atuais { PETR4: 38.5, ... } */
let quotes = {};


/* =========================
   HISTÓRICO
========================= */

function historyEntry(
    action,
    item,
    timestamp = new Date().toISOString()
) {
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
        history = JSON.parse(
            localStorage.getItem(HISTORY_KEY)
        ) || [];
    } catch {
        history = [];
    }

    history.push(
        historyEntry(action, item)
    );

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(history)
    );
}


/* =========================
   CLASSE DE CADA ATIVO
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


/* =========================
   CADASTRAR APORTE
========================= */

async function cadastrarAporteAPI(dados) {

    const token = getToken();

    const headers = {
        "Content-Type": "application/json"
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_BASE_URL}/aportes/registrar-aporte`,
        {
            method: "POST",
            headers,
            body: JSON.stringify(dados)
        }
    );

    const text = await response.text();

    console.log("=== RESPOSTA BRUTA DA API ===");
    console.log("HTTP:", response.status);
    console.log("Resposta:", text);

    let data;

    try {
        data = JSON.parse(text);
    } catch {
        console.error("A resposta NÃO é JSON válido.");
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
   CARREGAR APORTES
========================= */

async function carregarAportesAPI() {

    const token = getToken();

    if (!token) {
        console.error("Token não encontrado.");
        return;
    }

    const response = await fetch(
        `${API_BASE_URL}/aportes/buscar-aportes`,
        {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
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

        window.location.href = "login.php";

        return;
    }

    if (!response.ok || data.sucesso !== true) {
        throw new Error(
            data.mensagem ||
            data.message ||
            `Erro HTTP ${response.status}.`
        );
    }

    /*
     * Converte os dados da API
     * para o formato utilizado pelo render().
     */

    contributions = (data.ativos || []).map(item => ({
        id: item.id_aporte,

        asset: item.ativo_aporte,

        category: item.categoria_ativo,

        walletId: null,

        amount: Number(item.valor_aporte),

        type: item.tipo_aporte,

        date: item.data_aporte || null,

        recurrence:
            item.recorrencia_aporte === "Semanal"
                ? "weekly"
                : item.recorrencia_aporte === "Mensal"
                    ? "monthly"
                    : "none",

        recurrenceDay: null,

        observation: "",

        active: true,

        unitPrice:
            Number(item.quantidade_aporte) > 0
                ? Number(item.valor_aporte) /
                Number(item.quantidade_aporte)
                : 0
    }));

    console.log(
        "Aportes convertidos para a tela:",
        contributions
    );

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
========================= */

function randomBetween(min, max) {

    return Math.random() * (max - min) + min;
}

function moneyRain(count = 26) {

    const container =
        document.createElement("div");

    container.className = "money-rain";

    document.body.appendChild(container);

    for (let i = 0; i < count; i++) {

        const note =
            document.createElement("div");

        note.className = "money-note";

        note.textContent = "R$";

        const left =
            randomBetween(0, 100);

        const duration =
            randomBetween(2.2, 3.6);

        const delay =
            randomBetween(0, 0.5);

        const drift =
            randomBetween(-120, 120);

        const rotateStart =
            randomBetween(-40, 40);

        const rotateEnd =
            randomBetween(180, 540);

        const size =
            randomBetween(0.8, 1.3);

        note.style.left = `${left}vw`;

        note.style.animationDuration =
            `${duration}s`;

        note.style.animationDelay =
            `${delay}s`;

        note.style.setProperty(
            "--drift",
            `${drift}px`
        );

        note.style.setProperty(
            "--rot-start",
            `${rotateStart}deg`
        );

        note.style.setProperty(
            "--rot-end",
            `${rotateEnd}deg`
        );

        note.style.transform =
            `scale(${size})`;

        container.appendChild(note);
    }

    setTimeout(() => {
        container.remove();
    }, 4200);
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
    new Date().toLocaleDateString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );


/* =========================
   VALORES RÁPIDOS
========================= */

document
    .querySelectorAll("[data-value]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const value =
                    Number(button.dataset.value);

                amount.value =
                    money(value);

                document
                    .querySelectorAll("[data-value]")
                    .forEach(btn =>
                        btn.classList.remove(
                            "selected"
                        )
                    );

                button.classList.add(
                    "selected"
                );
            }
        );
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
                btn.classList.remove(
                    "selected"
                )
            );
    }
);


/* =========================
   FORMATAÇÃO DO VALOR
========================= */

amount.addEventListener(
    "input",
    () => {

        let value =
            amount.value.replace(/\D/g, "");

        if (!value) {
            amount.value = "";
            return;
        }

        amount.value =
            money(Number(value) / 100);
    }
);


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

        const value =
            getAmount();

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


        /* =========================
           CARTEIRA
        ========================= */

        console.log(
            "=== DEBUG CARTEIRA ==="
        );

        if (
            typeof Carteiras === "undefined"
        ) {

            console.error(
                "Carteiras não está disponível."
            );

            toast(
                "Sistema de carteiras não carregado."
            );

            return;
        }

        console.log(
            "Carteiras.list():",
            Carteiras.list()
        );

        console.log(
            "Carteira ativa:",
            Carteiras.getActive()
        );

        let walletId = null;

        await Carteiras.load();

        const carteiras =
            Carteiras.list();

        console.log(
            "Carteiras disponíveis:",
            carteiras
        );

        if (
            !carteiras ||
            carteiras.length === 0
        ) {

            toast(
                "Nenhuma carteira encontrada."
            );

            return;
        }

        if (
            carteiras.length === 1
        ) {

            walletId =
                carteiras[0].id;

        } else {

            const active =
                Carteiras.getActive();

            const chosen =
                await Carteiras.askWallet({
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


        /* =========================
           VALIDAR ID DA CARTEIRA
        ========================= */

        walletId =
            Number(walletId);

        if (
            !Number.isInteger(walletId) ||
            walletId <= 0
        ) {

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


        /* =========================
           COTAÇÃO NO MOMENTO DA COMPRA
        ========================= */

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


        /* =========================
           ATIVOS SEM COTAÇÃO
        ========================= */

        const SEM_COTACAO = [
            "CDB Nubank",
            "Outro"
        ];

        let unitPrice =
            buyQuote[asset.value] ?? null;

        if (
            !unitPrice ||
            Number(unitPrice) <= 0
        ) {

            if (
                SEM_COTACAO.includes(
                    asset.value
                )
            ) {

                unitPrice = null;

            } else {

                toast(
                    "Não foi possível obter a cotação do ativo. O aporte não foi salvo."
                );

                return;
            }
        }


        /* =========================
           QUANTIDADE
        ========================= */

        const quantity =
            unitPrice
                ? value / Number(unitPrice)
                : value;


        /* =========================
           NOME DO ATIVO
        ========================= */

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


        /* =========================
           RECORRÊNCIA PARA API
        ========================= */

        const recorrenciaAPI = {
            none: "Único",
            weekly: "Semanal",
            monthly: "Mensal"
        };


        /* =========================
           DADOS PARA API
        ========================= */

        const dadosAPI = {

            id_carteira:
                Number(walletId),

            ativo_aporte:
                asset.value,

            name_ativo:
                nameAsset,

            categoria_ativo:
                classOf(asset.value),

            tipo_aporte:
                type.value,

            quantidade_aporte:
                quantity,

            valor_aporte:
                value,

            data_aporte:
                date.value,

            recorrencia_aporte:
                recorrenciaAPI[
                recurrence.value
                ] || "Único",

            observacao_aporte:
                observation.value.trim()
        };

        console.log(
            "Enviando aporte para a API:",
            dadosAPI
        );


        /* =========================
           SALVAR NA API
        ========================= */

        try {

            const resultado =
                await cadastrarAporteAPI(
                    dadosAPI
                );

            console.log(
                "Aporte salvo na API:",
                resultado
            );


            /*
             * Recarrega os aportes diretamente
             * do banco.
             */
            await carregarAportesAPI();


            clearForm();

            render();


            /* Animação original */
            moneyRain();


            /* Notificação original */
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

    recurrence.value =
        "none";

    recurrenceDay.value =
        "";

    recurrenceDayBox.classList.add(
        "hidden"
    );

    document
        .querySelectorAll("[data-value]")
        .forEach(btn =>
            btn.classList.remove(
                "selected"
            )
        );
}


/* =========================
   ÍCONE DO ATIVO
========================= */

function assetIcon(name) {

    const icons = {

        PETR4: [
            "P4",
            "green-bg"
        ],

        Bitcoin: [
            "₿",
            "orange-bg"
        ],

        "CDB Nubank": [
            "CDB",
            "cyan-bg"
        ],

        XPML11: [
            "FII",
            "yellow-bg"
        ]
    };

    return (
        icons[name] ||
        [
            "AT",
            "blue-bg"
        ]
    );
}


/* =========================
   FORMATAR DATA
========================= */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const [
        year,
        month,
        day
    ] = dateString.split("-");

    return `${day}/${month}/${year}`;
}


/* =========================
   TEXTO DA RECORRÊNCIA
========================= */

function recurrenceText(item) {

    if (
        item.recurrence === "weekly"
    ) {

        return "Semanal";
    }

    if (
        item.recurrence === "monthly"
    ) {

        return `Mensal - dia ${item.recurrenceDay}`;
    }

    return "Único";
}


/* =========================
   NOME DA CARTEIRA
========================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text ?? "";

    return div.innerHTML;
}

function walletLabel(item) {

    if (
        typeof Carteiras === "undefined" ||
        Carteiras.list().length < 2
    ) {

        return "";
    }

    const name =
        Carteiras.nameOf(
            Carteiras.normalize(
                item.walletId
            )
        );

    return ` • ${escapeHtml(name)}`;
}


/* =========================
   COTAÇÃO DO ATIVO
========================= */

function updateAssetPrice() {

    const box =
        $("#assetPrice");

    const price =
        quotes[asset.value];

    box.className =
        "asset-price";

    box.textContent =
        price
            ? `Cotação atual: ${money(price)}`
            : "";
}


/* =========================
   QUANTO VALE HOJE
========================= */

function nowInfo(item) {

    const price =
        quotes[item.asset];

    if (!price) {
        return "";
    }

    if (!item.unitPrice) {

        return `
            <span class="aporte-now">
                Cotação: ${money(price)}
            </span>
        `;
    }

    const value =
        (item.amount / item.unitPrice) *
        price;

    const diff =
        value - item.amount;

    const pct =
        (diff / item.amount) * 100;

    const sign =
        diff >= 0
            ? "+"
            : "";

    return `
        <span class="aporte-now ${diff >= 0 ? "up" : "down"}">
            Hoje: ${money(value)}
            (${sign}${pct.toFixed(2).replace(".", ",")}%)
            • Cotação: ${money(price)}
        </span>
    `;
}


/* =========================
   ALTERAÇÃO DO ATIVO
========================= */

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
            .fetch([
                asset.value
            ])
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

    if (
        contributions.length === 0
    ) {

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
     * Mostra o mais recente primeiro.
     */

    const sorted =
        [...contributions].sort(
            (a, b) =>
                new Date(b.date) -
                new Date(a.date)
        );


    sorted.forEach(item => {

        const [
            icon,
            color
        ] =
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
                        ${walletLabel(item)}
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
                ? `
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
                : ""
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
                    String(
                        contribution.id
                    ) === String(id)
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
   EXCLUIR APORTE
========================= */

contributionList.addEventListener(
    "click",
    async event => {

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
                    String(
                        contribution.id
                    ) === String(id)
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


        /* =========================
           TOKEN
        ========================= */

        const token =
            getToken();


        if (!token) {

            toast(
                "Sessão expirada. Faça login novamente."
            );

            return;
        }


        /* =========================
           EXCLUIR NO BANCO
        ========================= */

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/aportes/excluir-aporte`,
                    {
                        method: "DELETE",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`
                        },

                        body: JSON.stringify({
                            id_aporte: id
                        })
                    }
                );


            const text =
                await response.text();


            let data;


            try {

                data =
                    JSON.parse(text);

            } catch {

                throw new Error(
                    `A API retornou uma resposta inválida (HTTP ${response.status}).`
                );
            }


            /* =========================
               TOKEN EXPIRADO
            ========================= */

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "usuario"
                );

                window.location.href =
                    "login.php";

                return;
            }


            /* =========================
               ERRO DA API
            ========================= */

            if (
                !response.ok ||
                data.sucesso !== true
            ) {

                throw new Error(
                    data.mensagem ||
                    data.message ||
                    `Erro HTTP ${response.status}.`
                );
            }


            /* =========================
               BANCO CONFIRMOU
            ========================= */

            console.log(
                "Aporte excluído da API:",
                data
            );


            /*
             * Só remove da tela depois
             * que a API confirmar.
             */

            contributions =
                contributions.filter(
                    contribution =>
                        String(
                            contribution.id
                        ) !== String(id)
                );


            /* Histórico */

            logHistory(
                "removed",
                item
            );


            /* Cache */

            save();


            /* Atualiza tela */

            render();


            /* Mensagem */

            toast(
                "Aporte excluído."
            );


        } catch (error) {

            console.error(
                "Erro ao excluir aporte:",
                error
            );

            toast(
                error.message ||
                "Não foi possível excluir o aporte."
            );
        }
    }
);


/* =========================
   EXCLUIR TODOS OS APORTES
========================= */

$("#clearAllBtn").addEventListener(
    "click",
    () => {

        if (
            contributions.length === 0
        ) {

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


        /*
         * ATENÇÃO:
         * Este botão ainda remove apenas da tela/cache.
         *
         * A exclusão individual acima
         * já está integrada com a API.
         */

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


    /* Aportes deste mês */

    const monthContributions =
        contributions.filter(
            item => {

                if (!item.date) {
                    return false;
                }

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


    /* Aportes recorrentes ativos */

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


    /* Média */

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


    /* Próximo aporte */

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


/* =========================
   COTAÇÕES
========================= */

if (
    typeof Cotacoes !== "undefined"
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


            carregarAportesAPI()
                .then(() => {

                    render();

                })
                .catch(error => {

                    console.error(
                        "Erro ao carregar aportes:",
                        error
                    );

                    render();
                });
        }
    );
}