// Login com Google (Google Identity Services -> ID Token -> /auth/loginGoogle)

// Client ID do tipo "Aplicativo da Web" (é público, pode ficar no front).
// Tem que ser o MESMO valor de GOOGLE_CLIENT_ID_WEB no .env do back end.
const GOOGLE_CLIENT_ID = "407661889736-05nr228ois2n3c103to7707fbter8s1l.apps.googleusercontent.com";

// API_URL já é declarada em js/usuario.js (carregado antes deste arquivo).

function mostrarErroGoogle(msg) {
    const el = document.getElementById("erroGoogle");
    if (el) el.textContent = msg || "";
}

async function aoReceberCredencialGoogle(resposta) {
    mostrarErroGoogle("");

    try {
        const r = await fetch(`${API_URL}auth/loginGoogle`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: resposta.credential })
        });

        const texto = await r.text();
        let resultado;

        try {
            resultado = JSON.parse(texto);
        } catch (e) {
            console.error("Resposta inesperada do servidor:", texto);
            mostrarErroGoogle("O servidor retornou um erro inesperado.");
            return;
        }

        if (!resultado.success) {
            mostrarErroGoogle(resultado.message || "Não foi possível entrar com o Google.");
            return;
        }

        // Mesmo comportamento do login por e-mail/senha (js/usuario.js)
        localStorage.removeItem("accuracy_profile_data");
        localStorage.removeItem("accuracy_avatar");
        localStorage.setItem("token", resultado.token);
        localStorage.setItem("usuario", JSON.stringify(resultado.user));

        window.location.href = "dashboard.php";

    } catch (erro) {
        console.error("ERRO NO LOGIN COM GOOGLE:", erro);
        mostrarErroGoogle("Erro de conexão. Tente novamente em instantes.");
    }
}

// O botão oficial é renderizado em 400x40 px; aqui ele é esticado
// para cobrir exatamente o botão visual (largura e altura).
function ajustarEscalaGoogle() {
    const wrap = document.querySelector(".google-wrap");
    const overlay = document.getElementById("googleBtn");
    if (!wrap || !overlay) return;

    const sx = wrap.offsetWidth / 400;
    const sy = wrap.offsetHeight / 40;
    overlay.style.transform = `scale(${sx}, ${sy})`;
}

function iniciarGoogle() {
    const overlay = document.getElementById("googleBtn");
    if (!overlay) return;

    // O script do Google carrega com async/defer: se ainda não chegou, tenta de novo
    if (!window.google || !google.accounts || !google.accounts.id) {
        setTimeout(iniciarGoogle, 150);
        return;
    }

    google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: aoReceberCredencialGoogle
    });

    google.accounts.id.renderButton(overlay, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        locale: "pt-BR",
        width: 400
    });

    ajustarEscalaGoogle();
}

document.addEventListener("DOMContentLoaded", iniciarGoogle);
window.addEventListener("resize", ajustarEscalaGoogle);