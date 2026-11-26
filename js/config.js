/* =========================================================
   CONFIGURAÇÃO DO SITE
   Endereço da API usado por todas as páginas. Carregue este
   arquivo antes de qualquer outro script.

   Para testar com a API rodando no computador, abra o console
   do navegador e execute:
       localStorage.setItem("accuracy_api", "http://localhost:8080")
   e para voltar à API publicada:
       localStorage.removeItem("accuracy_api")
========================================================= */
(function () {
    "use strict";

    const API_PUBLICADA = "https://accuracyappapi.onrender.com";

    let escolhida = "";
    try {
        escolhida = localStorage.getItem("accuracy_api") || "";
    } catch (erro) {
        escolhida = "";
    }

    window.ACCURACY_API_URL = /^https?:\/\/[^\s/]+(:\d+)?$/.test(escolhida)
        ? escolhida
        : API_PUBLICADA;
})();
