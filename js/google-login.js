// Google Identity Services (OAuth 2.0 / OpenID Connect ID token)
// Client ID publico; deve coincidir com GOOGLE_CLIENT_ID_WEB na API Render.
const GOOGLE_CLIENT_ID = "407661889736-05nr228ois2n3c103to7707fbter8s1l.apps.googleusercontent.com";
const GOOGLE_API_LOGIN = window.ACCURACY_API_URL + "/auth/loginGoogle";

function mostrarErroGoogle(mensagem) {
    const erro = document.getElementById("erroGoogle");
    if (erro) erro.textContent = mensagem || "";
}

async function aoReceberCredencialGoogle(resposta) {
    mostrarErroGoogle("");
    if (!resposta || !resposta.credential) {
        mostrarErroGoogle("O Google nao retornou uma credencial valida.");
        return;
    }
    try {
        const resultadoHttp = await fetch(GOOGLE_API_LOGIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: resposta.credential })
        });
        const texto = await resultadoHttp.text();
        let dados;
        try { dados = JSON.parse(texto); }
        catch (_) { throw new Error("Resposta inesperada da API. Verifique o deploy do Render."); }
        if (!resultadoHttp.ok || dados.success !== true || !dados.token || !dados.user) {
            throw new Error(dados.message || dados.mensagem || "Nao foi possivel entrar com o Google.");
        }
        // Mesma sessao do login comum, sem mexer nas credenciais administrativas.
        localStorage.removeItem("accuracy_profile_data");
        localStorage.removeItem("accuracy_avatar");
        localStorage.setItem("token", dados.token);
        localStorage.setItem("usuario", JSON.stringify(dados.user));
        if (dados.refreshToken) localStorage.setItem("refreshToken", dados.refreshToken);
        else localStorage.removeItem("refreshToken");
        window.location.assign("dashboard.php");
    } catch (e) {
        console.error("Falha no login Google:", e.message);
        mostrarErroGoogle(e.message || "Nao foi possivel autenticar com o Google.");
    }
}

function iniciarGoogle(tentativa = 0) {
    const el = document.getElementById("googleBtn");
    if (!el) return;
    if (!window.google?.accounts?.id) {
        if (tentativa < 30) setTimeout(() => iniciarGoogle(tentativa + 1), 200);
        else mostrarErroGoogle("O Google nao carregou. Verifique a conexao ou o bloqueador de anuncios.");
        return;
    }
    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: aoReceberCredencialGoogle,
        ux_mode: "popup"
    });
    el.replaceChildren();
    google.accounts.id.renderButton(el, {
        type: "standard",
        theme: "filled_blue",
        size: "large",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
        locale: "pt-BR",
        width: 360
    });
}

document.addEventListener("DOMContentLoaded", () => iniciarGoogle());