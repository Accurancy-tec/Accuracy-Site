(function () {

    const LOGIN_URL = "login.php";

    const token = localStorage.getItem("token");

    let user = null;

    try {
        user = JSON.parse(localStorage.getItem("usuario"));
    } catch (e) {}

    /* Sem login -> volta para a tela de login */
    if (!token || !user) {
        window.location.href = LOGIN_URL;
        return;
    }

    /* Dados disponíveis para outros scripts */
    window.usuarioLogado = {
        nome: user.nome_usuario || "",
        email: user.email_usuario || ""
    };

    /* Se a pessoa editou o nome no perfil, usa o editado */
    try {
        const editado = JSON.parse(localStorage.getItem("accuracy_profile_data"));
        if (editado && editado.nome) window.usuarioLogado.nome = editado.nome;
    } catch (e) {}

    document.addEventListener("DOMContentLoaded", function () {

        const nome = window.usuarioLogado.nome || "Usuário";
        const inicial = nome.trim().charAt(0).toUpperCase();

        /* Nome no topo */
        document.querySelectorAll(".user-info strong").forEach(el => {
            el.textContent = nome;
        });

        /* Inicial no avatar (se não tiver foto salva) */
        if (!localStorage.getItem("accuracy_avatar")) {
            document.querySelectorAll(".avatar, .big-avatar").forEach(el => {
                el.textContent = inicial;
            });
        }

        /* Botão "Sair da conta" (perfil.php) */
        const logout = document.querySelector(".security-item.logout");

        if (logout) {
            logout.style.cursor = "pointer";
            logout.addEventListener("click", function () {
                localStorage.removeItem("token");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("usuario");
                localStorage.removeItem("accuracy_profile_data");
                window.location.href = LOGIN_URL;
            });
        }
    });

})();