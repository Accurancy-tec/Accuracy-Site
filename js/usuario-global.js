(function () {

    const LOGIN_URL = "login.php";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    const TOKEN_KEY = "token";
    const REFRESH_TOKEN_KEY = "refreshToken";

    const originalFetch = window.fetch.bind(window);

    let refreshPromise = null;

    /*
    =========================================================
    RENOVAR ACCESS TOKEN
    =========================================================
    */

    async function renovarAccessToken() {

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            return false;
        }

        // Evita várias renovações simultâneas.
        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = (async function () {

            try {

                const resposta = await originalFetch(
                    `${API_BASE_URL}/auth/refresh`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            refresh_token: refreshToken
                        })
                    }
                );

                const resultado = await resposta.json();

                if (
                    !resposta.ok ||
                    resultado.success !== true ||
                    !resultado.token
                ) {

                    encerrarSessao();

                    return false;

                }

                // Atualiza somente o access token.
                localStorage.setItem(
                    TOKEN_KEY,
                    resultado.token
                );

                return true;

            } catch (erro) {

                console.error(
                    "Erro ao renovar o token:",
                    erro
                );

                return false;

            } finally {

                refreshPromise = null;

            }

        })();

        return refreshPromise;

    }


    /*
    =========================================================
    INTERCEPTAR REQUISIÇÕES DA API
    =========================================================
    */

    window.fetch = async function (input, init = {}) {

        const url = typeof input === "string"
            ? input
            : input.url;

        // Mantém uma cópia da requisição original.
        const requestOriginal = input instanceof Request
            ? input.clone()
            : input;

        let resposta = await originalFetch(
            requestOriginal,
            init
        );

        const requisicaoDaAPI =
            typeof url === "string" &&
            url.startsWith(API_BASE_URL);

        const rotaRefresh =
            typeof url === "string" &&
            url.includes("/auth/refresh");

        // Só tenta renovar em respostas 401 da API.
        if (
            resposta.status !== 401 ||
            !requisicaoDaAPI ||
            rotaRefresh
        ) {

            return resposta;

        }

        const renovado = await renovarAccessToken();

        if (!renovado) {
            return resposta;
        }

        // Prepara novamente os headers da requisição.
        const headers = new Headers(
            init.headers ||
            (input instanceof Request ? input.headers : undefined)
        );

        const novoToken = localStorage.getItem(TOKEN_KEY);

        headers.set(
            "Authorization",
            `Bearer ${novoToken}`
        );

        // Repete a requisição com o novo access token.
        const novaEntrada = input instanceof Request
            ? input.clone()
            : input;

        resposta = await originalFetch(
            novaEntrada,
            {
                ...init,
                headers: headers
            }
        );

        return resposta;

    };


    /*
    =========================================================
    ENCERRAR SESSÃO
    =========================================================
    */

    function encerrarSessao() {

        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem("usuario");

        localStorage.removeItem("accuracy_profile_data");
        localStorage.removeItem("accuracy_avatar");

        window.location.href = LOGIN_URL;

    }


    /*
    =========================================================
    VERIFICAR USUÁRIO
    =========================================================
    */

    const token = localStorage.getItem(TOKEN_KEY);

    let user = null;

    try {

        user = JSON.parse(
            localStorage.getItem("usuario")
        );

    } catch (erro) {

        user = null;

    }

    if (!token || !user) {

        encerrarSessao();

        return;

    }


    /*
    =========================================================
    DADOS DISPONÍVEIS PARA OUTROS SCRIPTS
    =========================================================
    */

    window.usuarioLogado = {

        nome: user.nome_usuario || "",

        email: user.email_usuario || ""

    };


    /*
    =========================================================
    NOME EDITADO NO PERFIL
    =========================================================
    */

    try {

        const editado = JSON.parse(
            localStorage.getItem("accuracy_profile_data")
        );

        if (editado && editado.nome) {

            window.usuarioLogado.nome = editado.nome;

        }

    } catch (erro) {}


    /*
    =========================================================
    ATUALIZAR ELEMENTOS DA PÁGINA
    =========================================================
    */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const nome =
                window.usuarioLogado.nome || "Usuário";

            const inicial =
                nome.trim().charAt(0).toUpperCase();


            // Nome no topo.
            document
                .querySelectorAll(".user-info strong")
                .forEach(function (elemento) {

                    elemento.textContent = nome;

                });


            // Inicial do avatar.
            if (!localStorage.getItem("accuracy_avatar")) {

                document
                    .querySelectorAll(".avatar, .big-avatar")
                    .forEach(function (elemento) {

                        elemento.textContent = inicial;

                    });

            }


            // Botão de sair.
            const logout = document.querySelector(
                ".security-item.logout"
            );

            if (logout) {

                logout.style.cursor = "pointer";

                logout.addEventListener(
                    "click",
                    encerrarSessao
                );

            }

        }
    );


    // Disponibiliza a renovação para outros scripts, se necessário.
    window.accuracyRefreshToken = renovarAccessToken;

})();