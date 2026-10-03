/*
=========================================================
CARTEIRA

Página responsável por exibir os aportes
separados por carteira.
=========================================================
*/

(function () {

    "use strict";

    /*
    =====================================================
    VERIFICAÇÕES
    =====================================================
    */

    if (typeof Carteiras === "undefined") {

        console.error(
            "Carteiras não foi carregado."
        );

        return;
    }

    if (typeof Cotacoes === "undefined") {

        console.error(
            "Cotacoes não foi carregado."
        );

        return;
    }

    /*
    =====================================================
    SELECTOR
    =====================================================
    */

    const $ = selector =>
        document.querySelector(selector);

    /*
    =====================================================
    STORAGE DOS APORTES

    Mantido temporariamente para compatibilidade
    com o sistema atual.

    O ID da carteira agora deve ser o ID do banco.
    =====================================================
    */

    const STORAGE_KEY =
        "accuracy_aportes";

    /*
    =====================================================
    COTAÇÕES
    =====================================================
    */

    let quotes = {};

    /*
    =====================================================
    LER APORTES
    =====================================================
    */

    function readContributions() {

        try {

            const list =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    )
                );

            return Array.isArray(list)
                ? list
                : [];

        } catch {

            return [];

        }

    }

    /*
    =====================================================
    CARTEIRA ATIVA
    =====================================================
    */

    function effectiveActive() {

        const wallets =
            Carteiras.list();

        if (wallets.length === 1) {

            return wallets[0].id;

        }

        return Carteiras.getActive();

    }

    /*
    =====================================================
    APORTES DA CARTEIRA
    =====================================================
    */

    function contributionsOf(walletId) {

        const all =
            readContributions();

        if (walletId === "all") {

            return all;

        }

        const normalized =
            Carteiras.normalize(walletId);

        return all.filter(item =>
            Carteiras.normalize(
                item.walletId
            ) === normalized
        );

    }

    /*
    =====================================================
    FORMATAR DINHEIRO
    =====================================================
    */

    function money(value) {

        const number =
            Number(value) || 0;

        return number.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }

    /*
    =====================================================
    ESCAPAR HTML
    =====================================================
    */

    function escapeHtml(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text ?? "";

        return div.innerHTML;

    }

    /*
    =====================================================
    PORCENTAGEM
    =====================================================
    */

    function percent(value, total) {

        if (!total) {
            return 0;
        }

        return (
            Number(value) /
            Number(total)
        ) * 100;

    }

    /*
    =====================================================
    ABAS DAS CARTEIRAS
    =====================================================
    */

    function renderTabs(active) {
        console.log("RENDERIZANDO ABAS:", Carteiras.list());

        const wallets =
            Carteiras.list();

        const items =
            wallets.length > 1
                ? [
                    {
                        id: "all",
                        name: "Todas"
                    },
                    ...wallets
                ]
                : wallets;

        const tabs =
            $("#walletTabs");
        console.log("ELEMENTO walletTabs:", tabs);
        console.log("CARTEIRAS QUE SERÃO RENDERIZADAS:", wallets);

        if (!tabs) {
            return;
        }

        tabs.innerHTML = "";
        console.log("LIMPANDO E RECRIANDO walletTabs");

        items.forEach(wallet => {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "wallet-tab" +
                (
                    String(wallet.id) ===
                        String(active)
                        ? " active"
                        : ""
                );

            button.textContent =
                wallet.name;

            button.addEventListener(
                "click",
                () => {

                    Carteiras.setActive(
                        wallet.id
                    );

                    render();

                }
            );

            tabs.appendChild(button);

        });

        /*
        =================================================
        BOTÃO EXCLUIR

        Como exclusão ainda não existe na API,
        deixamos desativado.
        =================================================
        */

        const deleteBtn =
            $("#deleteWalletBtn");

        if (deleteBtn) {

            deleteBtn.hidden = true;

        }

    }

    /*
    =====================================================
    RENDERIZAR
    =====================================================
    */

    function render() {

        const active =
            effectiveActive();

        renderTabs(active);

        const contributions =
            contributionsOf(active);

        /*
        ================================================
        AQUI VOCÊ PODE MANTER O RESTANTE DO HTML
        DA SUA PÁGINA ORIGINAL.
        ================================================
        */

        console.log(
            "Carteira ativa:",
            active
        );

        console.log(
            "Nome:",
            Carteiras.nameOf(active)
        );

        console.log(
            "Aportes:",
            contributions
        );

    }

    /*
    =====================================================
    NOVA CARTEIRA
    =====================================================
    */

    const newWalletBtn =
        $("#newWalletBtn");

    if (newWalletBtn) {
        newWalletBtn.addEventListener(
            "click",
            async () => {

                await Carteiras.promptNewWallet();

                await Carteiras.load();

                render();

                console.log(
                    "TELA ATUALIZADA:",
                    Carteiras.list()
                );
            }
        );
    }
    /*
    =====================================================
    EXCLUSÃO
    =====================================================
    */

    const deleteWalletBtn =
        $("#deleteWalletBtn");

    if (deleteWalletBtn) {

        deleteWalletBtn.addEventListener(
            "click",
            () => {

                console.warn(
                    "Exclusão de carteira ainda não está disponível na API."
                );

            }
        );

    }

    /*
    =====================================================
    STORAGE
    =====================================================
    */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key === STORAGE_KEY ||
                event.key ===
                "accuracy_carteira_ativa"
            ) {

                render();

            }

        }
    );

    /*
    =====================================================
    INICIALIZAR

    IMPORTANTE:
    primeiro carrega a API,
    depois renderiza.
    =====================================================
    */

    Carteiras.load()
        .then(() => {

            render();

            /*
            =============================================
            ATUALIZA COTAÇÕES
            =============================================
            */

            if (
                typeof Cotacoes.watch ===
                "function"
            ) {

                Cotacoes.watch(

                    () =>
                        contributionsOf(
                            effectiveActive()
                        ).map(
                            item => item.asset
                        ),

                    result => {

                        quotes = result;

                        render();

                    }

                );

            }

        });

})();