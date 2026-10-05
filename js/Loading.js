/* =========================
   LOADING (reutilizável em qualquer página)

   Loading.on(elemento)   -> mostra o spinner na área
   Loading.off(elemento)  -> tira o spinner
   Loading.bar(true/false)-> barra fina no topo da página

   Por segurança, todo spinner some sozinho depois de 25s
   (para nunca ficar girando pra sempre se a API cair).
========================= */

const Loading = (function () {

    "use strict";

    const LIMITE_MS = 25000;

    function resolver(alvo) {

        if (typeof alvo === "string") {
            return document.querySelector(alvo);
        }

        return alvo || null;
    }

    function on(alvo) {

        const el = resolver(alvo);

        if (!el) {
            return;
        }

        el.classList.add("is-loading");

        clearTimeout(el._loadingTimer);

        el._loadingTimer = setTimeout(() => {
            el.classList.remove("is-loading");
        }, LIMITE_MS);
    }

    function off(alvo) {

        const el = resolver(alvo);

        if (!el) {
            return;
        }

        clearTimeout(el._loadingTimer);

        el.classList.remove("is-loading");
    }

    function bar(ativo) {

        let barra = document.querySelector(".loading-bar");

        if (ativo && !barra) {

            barra = document.createElement("div");
            barra.className = "loading-bar";
            document.body.appendChild(barra);

            setTimeout(() => bar(false), LIMITE_MS);

        } else if (!ativo && barra) {

            barra.remove();
        }
    }

    return { on, off, bar };

})();