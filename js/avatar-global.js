
/* =========================================
   AVATAR GLOBAL - ACCURACY
   Foto carregada pela API
========================================= */

(function () {
    const CHAVE = "accuracy_avatar";

    const API =
        "https://accuracyappapi.onrender.com";

    function obterInicial() {
        try {
            const usuario = JSON.parse(
                localStorage.getItem("usuario") || "{}"
            );

            return (usuario.nome_usuario || "U")
                .trim()
                .charAt(0)
                .toUpperCase();

        } catch (erro) {
            return "U";
        }
    }

    function aplicarFoto(url) {
        const avatares = document.querySelectorAll(
            ".avatar, .big-avatar"
        );

        avatares.forEach(elemento => {
            if (url) {
                elemento.style.backgroundImage =
                    `url("${url}")`;

                elemento.style.backgroundSize = "cover";
                elemento.style.backgroundPosition = "center";

                elemento.textContent = "";
            } else {
                elemento.style.removeProperty(
                    "background-image"
                );

                elemento.style.removeProperty(
                    "background-size"
                );

                elemento.style.removeProperty(
                    "background-position"
                );

                elemento.textContent = obterInicial();
            }
        });
    }

    async function carregarFoto() {
        const token = localStorage.getItem("token");

        if (!token) {
            localStorage.removeItem(CHAVE);
            aplicarFoto(null);
            return;
        }

        try {
            const resposta = await fetch(
                `${API}/auth/perfilObter`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const dados = await resposta.json();

            if (
                !resposta.ok ||
                !dados.success ||
                !dados.user
            ) {
                console.warn(
                    "Não foi possível carregar o avatar."
                );
                return;
            }

            const url = dados.user.foto_usuario || null;

            if (url) {
                localStorage.setItem(CHAVE, url);
            } else {
                localStorage.removeItem(CHAVE);
            }

            aplicarFoto(url);

        } catch (erro) {
            console.error(
                "Erro ao carregar avatar:",
                erro
            );
        }
    }

    window.addEventListener(
        "accuracy:avatar-atualizado",
        event => {
            aplicarFoto(event.detail?.url || null);
        }
    );

    window.addEventListener(
        "storage",
        event => {
            if (event.key === CHAVE) {
                aplicarFoto(event.newValue || null);
            }
        }
    );

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            carregarFoto
        );
    } else {
        carregarFoto();
    }
})();
