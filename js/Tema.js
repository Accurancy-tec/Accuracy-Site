/* =========================
   CONTROLE DE TEMA
========================= */

(function () {

    const raiz = document.documentElement;


    /* TEMA SALVO OU PADRÃO (escuro) */

    const temaSalvo = localStorage.getItem("tema") || "dark";

    aplicarTema(temaSalvo);


    /* APLICA O TEMA */

    function aplicarTema(tema) {

        if (tema === "light") {

            raiz.setAttribute("data-theme", "light");

        } else {

            raiz.removeAttribute("data-theme");
        }

        atualizarIcone(tema);
        atualizarLabel(tema);
    }


    /* TROCA O ÍCONE DO BOTÃO (sol / lua) */

    function atualizarIcone(tema) {

        const icone = document.querySelector("#themeBtn i");

        if (!icone) return;

        icone.className =
            tema === "light" ? "bi bi-moon" : "bi bi-sun";
    }


    /* ATUALIZA O TEXTO "Tema escuro / Tema claro" */

    function atualizarLabel(tema) {

        const label = document.getElementById("temaLabel");

        if (!label) return;

        label.textContent =
            tema === "light" ? "Tema claro" : "Tema escuro";
    }


    /* ALTERNA */

    function alternarTema() {

        const atual =
            raiz.getAttribute("data-theme") === "light"
                ? "light"
                : "dark";

        const novo = atual === "light" ? "dark" : "light";

        localStorage.setItem("tema", novo);

        aplicarTema(novo);
    }


    /* LIGA OS GATILHOS DEPOIS QUE A PÁGINA CARREGA */

    document.addEventListener("DOMContentLoaded", function () {

        aplicarTema(localStorage.getItem("tema") || "dark");

        const botao = document.getElementById("themeBtn");

        if (botao) {
            botao.addEventListener("click", alternarTema);
        }

        /* A LINHA "Aparência" DO PERFIL TAMBÉM TROCA O TEMA */

        const linhaAparencia = document.getElementById("linhaAparencia");

        if (linhaAparencia) {

            linhaAparencia.style.cursor = "pointer";
            linhaAparencia.addEventListener("click", alternarTema);
        }
    });

})();