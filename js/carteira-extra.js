/* =========================================================
   CARTEIRA - ANIMAÇÃO DE CARREGAMENTO

   Carregar DEPOIS do resumoCarteiras.js e do loading.js,
   e ANTES do carteira-aportes.js.

   Não altera nenhum arquivo existente: liga o spinner na
   abertura da página e desliga quando o resumo das carteiras
   (ResumoCarteiras.load) termina de chegar da API.
========================================================= */

(function () {

    "use strict";

    const areas = [
        ".wallet-bar",
        ".cards",
        ".content"
    ]
        .map(seletor => document.querySelector(seletor))
        .filter(Boolean);


    function ligar() {
        areas.forEach(area => Loading.on(area));
    }

    function desligar() {
        // pequena folga para o render() da página terminar de desenhar
        setTimeout(() => {
            areas.forEach(area => Loading.off(area));
        }, 300);
    }


    ligar();


    const carregarOriginal = ResumoCarteiras.load;

    let primeiraVez = true;

    ResumoCarteiras.load = function () {

        const promessa = carregarOriginal.apply(this, arguments);

        // só a primeira busca (a da abertura da página) controla o spinner
        if (primeiraVez) {

            primeiraVez = false;

            promessa.then(desligar, desligar);
        }

        return promessa;
    };

})();