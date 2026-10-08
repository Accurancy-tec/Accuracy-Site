/* ============================================================
   AUTH - renovação automática do token (access token dura 15 min)

   Carregue este arquivo ANTES dos demais scripts nas páginas
   logadas. Ele envolve o window.fetch: toda chamada para a API
   usa sempre o token atual, renova o token quando falta pouco
   para vencer (ou quando a API responde 401) e repete a chamada.
   A pessoa só é deslogada se o refresh token também for recusado
   (expirou em 30 dias, revogado ou inválido).
   ============================================================ */
(function () {

    const API_BASE = "https://accuracyappapi.onrender.com";
    const LOGIN_URL = "login.php";
    const MARGEM_SEGUNDOS = 60;   // renova quando faltar menos que isso

    const fetchOriginal = window.fetch.bind(window);

    function lerToken() {
        try { return localStorage.getItem("token"); } catch (e) { return null; }
    }

    function lerRefreshToken() {
        try { return localStorage.getItem("refreshToken"); } catch (e) { return null; }
    }

    function expiracaoDoToken(token) {
        try {
            const parte = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(atob(parte));
            return payload.exp || 0;
        } catch (e) {
            return 0;
        }
    }

    function tokenPertoDeVencer(token) {
        const exp = expiracaoDoToken(token);
        if (!exp) return false;
        return exp - Math.floor(Date.now() / 1000) < MARGEM_SEGUNDOS;
    }

    function deslogar() {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("usuario");
            localStorage.removeItem("accuracy_profile_data");
        } catch (e) {}
        if (!/login\.php$/.test(window.location.pathname)) {
            window.location.href = LOGIN_URL;
        }
    }

    /* Uma única renovação por vez (várias requisições podem falhar juntas) */
    let renovando = null;

    function renovarToken() {
        if (renovando) return renovando;

        const refreshToken = lerRefreshToken();
        if (!refreshToken) return Promise.resolve(null);

        renovando = (async function () {
            try {
                const resposta = await fetchOriginal(API_BASE + "/auth/refresh", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh_token: refreshToken })
                });

                if (resposta.status === 401 || resposta.status === 403) {
                    /* Refresh token realmente recusado: sessão acabou */
                    return { recusado: true };
                }

                const dados = await resposta.json();

                if (dados && dados.success && dados.token) {
                    localStorage.setItem("token", dados.token);
                    return { token: dados.token };
                }

                return null;

            } catch (e) {
                /* Falha de rede / API dormindo: não desloga, tenta de novo depois */
                return null;
            } finally {
                renovando = null;
            }
        })();

        return renovando;
    }

    function urlDaRequisicao(input) {
        return typeof input === "string" ? input : (input && input.url) || "";
    }

    function ehChamadaAutenticada(url) {
        return url.indexOf(API_BASE) === 0 && url.indexOf(API_BASE + "/auth/") !== 0;
    }

    function comTokenNoHeader(init, token) {
        const novo = Object.assign({}, init || {});
        const headers = new Headers(novo.headers || {});
        headers.set("Authorization", "Bearer " + token);
        novo.headers = headers;
        return novo;
    }

    window.fetch = async function (input, init) {

        const url = urlDaRequisicao(input);

        /* Só mexe em chamadas à API que já levam token */
        if (!ehChamadaAutenticada(url) || typeof input !== "string" || !lerRefreshToken()) {
            return fetchOriginal(input, init);
        }

        let token = lerToken();

        /* 1) Token vencendo: renova antes de enviar */
        if (token && tokenPertoDeVencer(token)) {
            const r = await renovarToken();
            if (r && r.token) token = r.token;
            else if (r && r.recusado) { deslogar(); return fetchOriginal(input, init); }
        }

        const tokenEnviado = token;
        let resposta = await fetchOriginal(
            input,
            tokenEnviado ? comTokenNoHeader(init, tokenEnviado) : init
        );

        if (resposta.status !== 401) return resposta;

        /* 2) API disse 401: outra aba pode já ter renovado, senão renova aqui */
        let tokenNovo = lerToken();

        if (!tokenNovo || tokenNovo === tokenEnviado) {
            const r = await renovarToken();

            if (r && r.recusado) {
                deslogar();
                return resposta;
            }

            tokenNovo = r && r.token ? r.token : null;
        }

        if (!tokenNovo) return resposta;

        return fetchOriginal(input, comTokenNoHeader(init, tokenNovo));
    };

    /* Mantém o token fresco mesmo com a página parada (ex.: aba aberta
       e o usuário volta depois de um tempo). */
    async function manterTokenAtivo() {
        const token = lerToken();
        if (!token || !lerRefreshToken()) return;

        if (tokenPertoDeVencer(token)) {
            const r = await renovarToken();
            if (r && r.recusado) deslogar();
        }
    }

    setInterval(manterTokenAtivo, 60 * 1000);

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) manterTokenAtivo();
    });

    window.Auth = { renovarToken: renovarToken, deslogar: deslogar };

})();