/*
=========================================================

CARTEIRAS (COMPARTILHADO)

Usado pelas páginas:

- Carteira
- Aportes

As carteiras são carregadas da API e usam
o ID REAL do banco de dados.

=========================================================
*/

const Carteiras = (function () {

    "use strict";

    const API_BASE_URL =
        "https://accuracyappapi.onrender.com";

    const ACTIVE_KEY =
        "accuracy_carteira_ativa";

    const MAIN_ID = null;

    let wallets = [];


    /*
    =====================================================
    TOKEN
    =====================================================
    */

    function getToken() {

        return localStorage.getItem("token");
    }


    /*
    =====================================================
    NORMALIZAR ID
    =====================================================
    */

    function normalizeId(id) {

        if (
            id === null ||
            id === undefined
        ) {

            return null;
        }

        return String(id);
    }


    /*
    =====================================================
    BUSCAR CARTEIRAS NA API
    =====================================================
    */

    async function load() {

        const token =
            getToken();


        if (!token) {

            console.error(
                "Token não encontrado."
            );

            wallets = [];

            return wallets;
        }


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/carteiras/buscar-carteiras`,
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            const texto = await response.text();
            let data;

            try {
                data = JSON.parse(texto);
            } catch (erro) {
                console.error("Resposta inválida da API de carteiras:", texto);
                throw new Error("A API não retornou JSON válido.");
            }

            console.log("Resposta das carteiras:", data);


            /*
            A API atual utiliza "success".
            Também aceitamos "sucesso" para
            manter compatibilidade.
            */

            if (
                !response.ok ||
                (
                    data.success !== true &&
                    data.sucesso !== true
                )
            ) {

                console.error(

                    "Erro ao buscar carteiras:",

                    data.mensagem ||
                    data.message ||
                    data.erro ||
                    data.detalhe ||
                    "Erro desconhecido"

                );

                wallets = [];

                return wallets;
            }


            const apiWallets =
                Array.isArray(
                    data.carteiras
                )
                    ? data.carteiras
                    : [];


            /*
            A API agora precisa retornar:

            {
                id_carteira,
                nome_carteira,
                tipo_carteira
            }
            */

            wallets =
                apiWallets.map(
                    wallet => ({

                        id:
                            normalizeId(
                                wallet.id_carteira
                            ),

                        name:
                            wallet.nome_carteira,

                        type:
                            wallet.tipo_carteira,

                        style:
                            wallet.estilo_carteira,

                        goal:
                            Number(wallet.meta_carteira) || 0

                    })
                );


            console.log(
                "Carteiras carregadas:",
                wallets
            );


            return wallets;

        } catch (error) {

            console.error(

                "Erro ao conectar com a API de carteiras:",

                error

            );

            wallets = [];

            return wallets;
        }
    }


    /*
    =====================================================
    LISTAR
    =====================================================
    */

    function list() {

        return wallets;
    }


    /*
    =====================================================
    NOME DA CARTEIRA
    =====================================================
    */

    function nameOf(id) {

        const normalized =
            normalizeId(id);


        const wallet =
            wallets.find(

                wallet =>
                    normalizeId(wallet.id)
                    === normalized

            );


        return wallet

            ? wallet.name

            : "Nenhuma carteira";
    }


    /*
    =====================================================
    NORMALIZAR CARTEIRA
    =====================================================
    */

    function normalize(id) {

        const normalized =
            normalizeId(id);


        const exists =
            wallets.some(

                wallet =>
                    normalizeId(wallet.id)
                    === normalized

            );


        if (exists) {

            return normalized;
        }


        if (wallets.length > 0) {

            return normalizeId(
                wallets[0].id
            );
        }


        return null;
    }


    /*
    =====================================================
    CARTEIRA ATIVA
    =====================================================
    */

    function getActive() {

        const id =
            localStorage.getItem(
                ACTIVE_KEY
            );


        if (id === "all") {

            return "all";
        }


        const normalized =
            normalizeId(id);


        const exists =
            wallets.some(

                wallet =>
                    normalizeId(wallet.id)
                    === normalized

            );


        if (exists) {

            return normalized;
        }


        if (wallets.length > 0) {

            return normalizeId(
                wallets[0].id
            );
        }


        return null;
    }


    /*
    =====================================================
    DEFINIR CARTEIRA ATIVA
    =====================================================
    */

    function setActive(id) {

        if (
            id === null ||
            id === undefined
        ) {

            localStorage.removeItem(
                ACTIVE_KEY
            );

            return;
        }


        localStorage.setItem(

            ACTIVE_KEY,

            normalizeId(id)

        );
    }


    /*
    =====================================================
    ADICIONAR CARTEIRA
    =====================================================
    */

    async function add(rawName, rawGoal, rawStyle, rawKind) {

        const name =
            String(
                rawName || ""
            ).trim();

        const goal = Number(rawGoal) || 0;
        const style = String(rawStyle || "").trim();

        /* "Real" ou "Simulada" (coluna tipo_carteira da API) */
        const kind = String(rawKind || "Real").trim();

        if (!["Real", "Simulada"].includes(kind)) {
            return { error: "Escolha se a carteira é Simulada ou Real." };
        }

        const allowedStyles = [
            "Cripto",
            "Internacional",
            "Renda Fixa",
            "Renda Variavel"
        ];

        if (!name) {

            return {
                error:
                    "Digite um nome para a carteira."
            };
        }

        if (!allowedStyles.includes(style)) {
            return { error: "Selecione o tipo da carteira." };
        }


        if (name.length > 30) {

            return {
                error:
                    "Use no máximo 30 caracteres."
            };
        }


        const exists =
            list().some(

                w =>
                    String(w.name || "").toLowerCase()
                    ===
                    name.toLowerCase()

            );


        if (exists) {

            return {
                error:
                    "Já existe uma carteira com esse nome."
            };
        }


        const token =
            getToken();


        if (!token) {

            return {
                error:
                    "Usuário não autenticado."
            };
        }


        try {

            const response =
                await fetch(

                    `${API_BASE_URL}/carteiras/criar-carteira`,

                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                nome_carteira:
                                    name,

                                tipo_carteira:
                                    kind,

                                estilo_carteira:
                                    style,

                                meta_carteira:
                                    goal > 0 ? goal : null

                            })

                    }
                );


            const texto =
                await response.text();


            console.log(
                "Resposta bruta da API:",
                texto
            );


            let data;


            try {

                data =
                    JSON.parse(texto);

            } catch (error) {

                console.error(

                    "A API não retornou JSON:",
                    texto

                );

                return {

                    error:
                        "A API retornou uma resposta inválida."

                };
            }


            console.log(

                "Resposta criação carteira:",
                data

            );


            if (

                !response.ok ||

                (
                    data.success !== true &&
                    data.sucesso !== true
                )

            ) {

                return {

                    error:
                        data.mensagem ||
                        data.message ||
                        data.erro ||
                        "Não foi possível criar a carteira."

                };
            }


            /*
            Busca novamente para obter
            o ID REAL criado no banco.
            */

            await load();


            window.dispatchEvent(
                new Event(
                    "carteirasAtualizadas"
                )
            );


            console.log(
                "Carteiras após criar:",
                wallets
            );


            const wallet =
                wallets.find(

                    wallet =>

                        wallet.name.toLowerCase()
                        ===
                        name.toLowerCase()

                );


            if (!wallet) {

                return {

                    error:
                        "Carteira criada, mas não foi possível localizar o ID dela."

                };
            }


            setActive(
                wallet.id
            );


            return {
                wallet
            };


        } catch (error) {

            console.error(
                "Erro ao criar carteira:",
                error
            );


            return {

                error:
                    "Não foi possível conectar com a API."

            };
        }
    }


    /*
    =====================================================
    REMOVER CARTEIRA
    =====================================================
    */

    async function remove(id) {

        const token =
            getToken();

        if (!token) {
            return { error: "Token não encontrado." };
        }

        try {

            /* A API lê o id pela query string (?id_carteira=) e responde
               { success, message } */
            const response =
                await fetch(
                    `${API_BASE_URL}/carteiras/excluir-carteira?id_carteira=${encodeURIComponent(Number(id))}`,
                    {
                        method: "POST",

                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                (data.success !== true && data.sucesso !== true)
            ) {

                return {
                    error:
                        data.message ||
                        data.mensagem ||
                        "Não foi possível excluir a carteira."
                };
            }

            if (getActive() === normalizeId(id)) {
                setActive(null);
            }

            await load();

            return { ok: true };

        } catch (erro) {

            console.error(erro);

            return {
                error:
                    "Erro de conexão ao excluir a carteira."
            };
        }
    }


    /*
    =====================================================
    ELEMENTO
    =====================================================
    */

    function el(
        tag,
        className,
        text
    ) {

        const element =
            document.createElement(tag);


        if (className) {

            element.className =
                className;
        }


        if (
            text !== undefined
        ) {

            element.textContent =
                text;
        }


        return element;
    }


    /*
    =====================================================
    MODAL
    =====================================================
    */

    function modal({
        title,
        text,
        okLabel,
        build,
        validate
    }) {

        return new Promise(
            resolve => {

                const overlay =
                    el(
                        "div",
                        "cw-overlay"
                    );


                const box =
                    el(
                        "div",
                        "cw-modal"
                    );


                box.setAttribute(
                    "role",
                    "dialog"
                );


                box.setAttribute(
                    "aria-modal",
                    "true"
                );


                box.append(

                    el(
                        "h3",
                        "",
                        title
                    )

                );


                if (text) {

                    box.append(

                        el(
                            "p",
                            "cw-text",
                            text
                        )

                    );
                }


                const control =
                    build(box);


                const error =
                    el(
                        "div",
                        "cw-error"
                    );


                const actions =
                    el(
                        "div",
                        "cw-actions"
                    );


                const cancel =
                    el(
                        "button",
                        "cw-btn",
                        "Cancelar"
                    );


                const ok =
                    el(
                        "button",
                        "cw-btn primary",
                        okLabel
                    );


                cancel.type =
                    "button";


                ok.type =
                    "button";


                actions.append(
                    cancel,
                    ok
                );


                box.append(
                    error,
                    actions
                );


                overlay.append(box);


                document.body.append(
                    overlay
                );


                function close(result) {

                    document.removeEventListener(
                        "keydown",
                        onKey
                    );


                    overlay.remove();


                    resolve(result);
                }


                let busy = false;


                async function submit() {

                    if (busy) {

                        return;
                    }


                    busy = true;

                    ok.disabled = true;


                    const value =
                        control.getValue();


                    let result;

                    try {

                        result =
                            validate

                                ? await validate(value)

                                : { value };

                    } finally {

                        busy = false;

                        ok.disabled = false;
                    }


                    if (result.error) {

                        error.textContent =
                            result.error;

                        return;
                    }


                    close(
                        result.value
                    );
                }


                function onKey(event) {

                    if (
                        event.key ===
                        "Escape"
                    ) {

                        close(null);
                    }


                    if (

                        event.key ===
                        "Enter" &&

                        event.target.tagName
                        !== "BUTTON"

                    ) {

                        event.preventDefault();

                        submit();
                    }
                }


                cancel.addEventListener(

                    "click",

                    () =>
                        close(null)

                );


                ok.addEventListener(

                    "click",

                    submit

                );


                overlay.addEventListener(

                    "mousedown",

                    event => {

                        if (
                            event.target
                            === overlay
                        ) {

                            close(null);
                        }

                    }

                );


                document.addEventListener(

                    "keydown",

                    onKey

                );


                control.focus();
            }
        );
    }


    /*
    =====================================================
    ESCOLHER CARTEIRA PARA O APORTE
    =====================================================
    */

    function askWallet({ selected, allowedIds } = {}) {
        const availableWallets = Array.isArray(allowedIds)
            ? list().filter(w => allowedIds.some(id => String(id) === String(w.id)))
            : list();


        if (
            availableWallets.length
            === 0
        ) {

            console.warn(

                "Nenhuma carteira disponível para receber o aporte."

            );


            return Promise.resolve(
                null
            );
        }


        const selectedId =
            normalizeId(
                selected
            );


        const pick =
            availableWallets.some(

                wallet =>
                    normalizeId(
                        wallet.id
                    ) === selectedId

            )

                ? selectedId

                : normalizeId(
                    availableWallets[0]?.id
                );


        return modal({

            title:
                "Em qual carteira deseja colocar este aporte?",

            text:
                "Escolha a carteira que vai receber o aporte.",

            okLabel:
                "Confirmar aporte",


            build(box) {

                const group =
                    el(
                        "div",
                        "cw-options"
                    );


                function sync() {

                    group

                        .querySelectorAll(
                            ".cw-option"
                        )

                        .forEach(
                            label => {

                                label.classList.toggle(

                                    "selected",

                                    label
                                        .querySelector(
                                            "input"
                                        )
                                        .checked

                                );

                            }
                        );
                }


                availableWallets.forEach(
                    wallet => {

                        const label =
                            el(
                                "label",
                                "cw-option"
                            );


                        const input =
                            document.createElement(
                                "input"
                            );


                        input.type =
                            "radio";


                        input.name =
                            "cw-wallet";


                        input.value =
                            normalizeId(
                                wallet.id
                            );


                        input.checked =
                            normalizeId(
                                wallet.id
                            ) === pick;


                        input.addEventListener(

                            "change",

                            sync

                        );


                        label.append(

                            input,

                            el(
                                "span",
                                "",
                                wallet.name
                            )

                        );


                        group.append(
                            label
                        );
                    }
                );


                box.append(group);


                sync();


                return {

                    getValue: () =>
                        group.querySelector(
                            "input:checked"
                        )?.value,


                    focus: () =>
                        group.querySelector(
                            "input:checked"
                        )?.focus()

                };
            }
        });
    }


    /*
    =====================================================
    NOVA CARTEIRA
    =====================================================
    */

    async function promptNewWallet() {

        /* valores aceitos pela API (estilo_carteira) */
        const TYPES = [
            ["Renda Fixa", "Renda Fixa"],
            ["Renda Variavel", "Renda Variável"],
            ["Cripto", "Cripto"],
            ["Internacional", "Internacional"]
        ];

        /* valores aceitos pela API (tipo_carteira) */
        const KINDS = [
            ["Simulada", "Simulada", "Teste estratégias sem usar dinheiro de verdade", "M9 3h6M10 3v6.2L5.4 17.6A2 2 0 0 0 7.1 20.5h9.8a2 2 0 0 0 1.7-2.9L14 9.2V3M7.5 14h9"],
            ["Real", "Real", "Acompanhe os seus investimentos reais", "M12 3l7 3v5.5c0 4.4-3 8.2-7 9.5-4-1.3-7-5.1-7-9.5V6l7-3z"]
        ];

        const brlFmt = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return modal({

            title:
                "Nova carteira",

            text:
                "",

            okLabel:
                "Criar carteira",

            build(box) {

                box.classList.add("cw-new");

                let type = "Renda Variavel";
                let kind = "Simulada";
                let cents = 0;


                /* ---- Nome ---- */

                const nameLabel = el("label", "cw-field-label", "Nome da carteira");
                const nameInput = el("input", "cw-input");

                nameInput.type = "text";
                nameInput.maxLength = 30;
                nameInput.placeholder = "Ex.: Reserva de emergência";
                nameInput.autocomplete = "off";
                nameInput.setAttribute("aria-label", "Nome da carteira");


                /* ---- Tipo (chips) ---- */

                const typeLabel = el("div", "cw-field-label", "Tipo de carteira");
                const typeGroup = el("div", "cw-chips");

                typeGroup.setAttribute("role", "radiogroup");
                typeGroup.setAttribute("aria-label", "Tipo de carteira");

                TYPES.forEach(([value, text]) => {

                    const chip = el("button", "cw-chip", text);

                    chip.type = "button";
                    chip.dataset.value = value;
                    chip.setAttribute("role", "radio");

                    chip.addEventListener("click", () => {
                        type = value;
                        syncType();
                    });

                    typeGroup.append(chip);
                });

                function syncType() {

                    typeGroup.querySelectorAll(".cw-chip").forEach(chip => {

                        const on = chip.dataset.value === type;

                        chip.classList.toggle("selected", on);
                        chip.setAttribute("aria-checked", String(on));
                    });
                }


                /* ---- Meta (R$) ---- */

                const goalLabel = el("label", "cw-field-label", "Meta da carteira");
                const goalInput = el("input", "cw-input cw-money");

                goalInput.type = "text";
                goalInput.inputMode = "numeric";
                goalInput.placeholder = "R$ 0,00";
                goalInput.autocomplete = "off";
                goalInput.setAttribute("aria-label", "Meta da carteira");

                goalInput.addEventListener("input", () => {

                    const digits = goalInput.value.replace(/\D/g, "").slice(0, 13);

                    cents = digits ? parseInt(digits, 10) : 0;

                    goalInput.value = cents > 0
                        ? brlFmt.format(cents / 100)
                        : "";
                });


                /* ---- Estilo (Simulada / Real) ---- */

                const kindLabel = el("div", "cw-field-label", "Estilo da carteira");
                const kindGroup = el("div", "cw-kinds");

                kindGroup.setAttribute("role", "radiogroup");
                kindGroup.setAttribute("aria-label", "Estilo da carteira");

                KINDS.forEach(([value, title, desc, icon]) => {

                    const card = el("button", "cw-kind");

                    card.type = "button";
                    card.dataset.value = value;
                    card.setAttribute("role", "radio");

                    const ico = el("span", "cw-kind-icon");

                    ico.innerHTML =
                        '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" ' +
                        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
                        'stroke-linejoin="round" aria-hidden="true"><path d="' + icon + '"/></svg>';

                    card.append(
                        ico,
                        el("strong", "", title),
                        el("span", "cw-kind-desc", desc)
                    );

                    card.addEventListener("click", () => {
                        kind = value;
                        syncKind();
                    });

                    kindGroup.append(card);
                });

                function syncKind() {

                    kindGroup.querySelectorAll(".cw-kind").forEach(card => {

                        const on = card.dataset.value === kind;

                        card.classList.toggle("selected", on);
                        card.setAttribute("aria-checked", String(on));
                    });
                }


                syncType();
                syncKind();

                box.append(
                    nameLabel, nameInput,
                    typeLabel, typeGroup,
                    goalLabel, goalInput,
                    kindLabel, kindGroup
                );

                return {

                    getValue: () => ({
                        name: nameInput.value,
                        goal: cents / 100,
                        style: type,
                        kind
                    }),

                    focus: () =>
                        nameInput.focus()
                };
            },

            validate:
                async function (value) {

                    const result =
                        await add(value.name, value.goal, value.style, value.kind);

                    return result.error
                        ? { error: result.error }
                        : { value: result.wallet };
                }
        });
    }


    /* Converte "50000", "50.000", "50.000,50" ou "R$ 50.000" em número */
    function parseMoney(texto) {

        let t = String(texto || "").replace(/[^\d.,]/g, "");

        if (!t) {
            return 0;
        }

        if (t.includes(",")) {
            t = t.replace(/\./g, "").replace(",", ".");
        } else if (/^\d{1,3}(\.\d{3})+$/.test(t)) {
            t = t.replace(/\./g, "");
        }

        const n = parseFloat(t);

        return Number.isFinite(n) && n > 0 ? n : 0;
    }


    /*
    =====================================================
    INICIALIZAÇÃO
    =====================================================
    */

    load();


    /*
    =====================================================
    EXPORTAÇÃO
    =====================================================
    */

    return {

        MAIN_ID,

        load,

        list,

        nameOf,

        normalize,

        add,

        remove,

        getActive,

        setActive,

        askWallet,

        promptNewWallet

    };

})();