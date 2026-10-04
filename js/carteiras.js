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


            const data =
                await response.json();


            console.log(
                "Resposta das carteiras:",
                data
            );


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
                            wallet.tipo_carteira

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

    async function add(rawName) {

        const name =
            String(
                rawName || ""
            ).trim();


        if (!name) {

            return {
                error:
                    "Digite um nome para a carteira."
            };
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
                    w.name.toLowerCase()
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
                                    "Real",

                                saldo_livre_carteira:
                                    0

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

    function remove(id) {

        console.warn(

            "A exclusão de carteiras precisa ser feita pela API.",

            id

        );


        return {

            error:
                "A exclusão de carteiras precisa ser implementada na API."

        };
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


                async function submit() {

                    const value =
                        control.getValue();


                    const result =
                        validate

                            ? await validate(value)

                            : { value };


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

    function askWallet(
        { selected } = {}
    ) {

        const availableWallets =
            list();


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

        return modal({

            title:
                "Nova carteira",

            text:
                "Dê um nome para a nova carteira.",

            okLabel:
                "Criar carteira",


            build(box) {

                const input =
                    el(
                        "input",
                        "cw-input"
                    );


                input.type =
                    "text";


                input.maxLength =
                    30;


                input.placeholder =
                    "Ex: Aposentadoria";


                box.append(input);


                return {

                    getValue: () =>
                        input.value,


                    focus: () =>
                        input.focus()

                };
            },


            validate:
                async function (value) {

                    const result =
                        await add(value);


                    return result.error

                        ? {
                            error:
                                result.error
                        }

                        : {
                            value:
                                result.wallet
                        };
                }
        });
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