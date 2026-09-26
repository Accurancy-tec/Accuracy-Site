/* =========================
   APLICA A FOTO DE PERFIL
   SALVA EM QUALQUER PÁGINA
   (usa o mesmo localStorage
   da tela de Perfil)
========================= */

(function () {

    const AVATAR_KEY = "accuracy_avatar";


    function applySavedAvatar() {

        const dataUrl =
            localStorage.getItem(AVATAR_KEY);

        if (!dataUrl) {
            return;
        }

        document
            .querySelectorAll(".avatar, .big-avatar")
            .forEach(el => {

                el.style.backgroundImage =
                    `url(${dataUrl})`;

                el.style.backgroundSize = "cover";

                el.style.backgroundPosition = "center";

                el.textContent = "";

            });

    }


    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            applySavedAvatar
        );

    } else {

        applySavedAvatar();

    }


    /*
       Se a foto for trocada em
       outra aba, atualiza aqui
       também
    */

    window.addEventListener("storage", event => {

        if (event.key === AVATAR_KEY) {

            applySavedAvatar();

        }

    });

})();