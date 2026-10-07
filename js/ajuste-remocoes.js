/* =========================================================
   AJUSTE DE REMOÇÕES (solução rápida, só neste navegador)

   Problema: a API apaga o aporte, mas não desconta a posição
   (item_investimento) da carteira. Por isso carteira e
   dashboard continuam mostrando o valor antigo.

   O que este arquivo faz, sem alterar nenhum outro arquivo:

   1. Quando a API confirma a exclusão de um aporte, guarda no
      localStorage quanto (valor e quantidade) saiu de qual ativo.
   2. Sempre que ResumoCarteiras.load() é chamado, desconta
      esses valores das posições antes de entregar para a tela.

   Onde carregar:
   - aportes.php   : DEPOIS do aportes.js
   - dashboard.php : DEPOIS do resumoCarteiras.js e ANTES do
                     dashboard-extra.js
   - carteira.php  : DEPOIS do resumoCarteiras.js (se a página
                     usar o ResumoCarteiras)

   IMPORTANTE: quando a API passar a descontar a posição sozinha,
   remova este arquivo das páginas, senão o desconto é feito duas
   vezes.
========================================================= */

(function () {

    "use strict";

    const CHAVE = "accuracy_ajuste_remocoes";

    const EPS = 1e-8;


    /* =====================================================
       LEITURA E GRAVAÇÃO
    ===================================================== */

    function lerAjustes() {

        try {

            const lista = JSON.parse(localStorage.getItem(CHAVE));

            return Array.isArray(lista) ? lista : [];

        } catch {

            return [];
        }
    }

    function salvarAjustes(lista) {

        localStorage.setItem(CHAVE, JSON.stringify(lista));
    }

    function registrarAjuste(ajuste) {

        const lista = lerAjustes();

        if (lista.some(a => String(a.id) === String(ajuste.id))) {
            return;
        }

        lista.push(ajuste);

        salvarAjustes(lista);
    }


    /* =====================================================
       1. PEGAR OS DADOS DO APORTE ANTES DE EXCLUIR
       (a lista "contributions" é a do aportes.js)
    ===================================================== */

    function dadosDoAporte(id) {

        if (typeof contributions === "undefined") {
            return null;
        }

        const item = contributions.find(
            c => String(c.id) === String(id)
        );

        if (!item) {
            return null;
        }

        const valor = Number(item.amount) || 0;
        const preco = Number(item.unitPrice) || 0;

        return {
            id: String(item.id),
            asset: item.asset,
            amount: valor,
            quantity: preco > 0 ? valor / preco : valor
        };
    }


    /* =====================================================
       OBSERVA A EXCLUSÃO: só registra se a API confirmar
    ===================================================== */

    if (typeof window.fetch === "function") {

        const fetchOriginal = window.fetch.bind(window);

        window.fetch = async function (input, init) {

            const url = typeof input === "string"
                ? input
                : (input && input.url) || String(input);

            const method = String(
                (init && init.method) ||
                (input && input.method) ||
                "GET"
            ).toUpperCase();

            let dados = null;

            if (url.includes("/aportes/excluir-aporte") && method === "DELETE") {

                try {

                    const corpo = JSON.parse(init.body);

                    dados = dadosDoAporte(corpo.id_aporte);

                } catch {

                    dados = null;
                }
            }

            const resposta = await fetchOriginal(input, init);

            if (dados) {

                try {

                    const json = await resposta.clone().json();

                    if (resposta.ok && json.sucesso === true) {
                        registrarAjuste(dados);
                    }

                } catch {
                    /* resposta sem JSON: não registra */
                }
            }

            return resposta;
        };
    }


    /* =====================================================
       2. DESCONTAR DAS POSIÇÕES
    ===================================================== */

    function aplicarAjustes(resumo) {

        if (!Array.isArray(resumo) || resumo.__ajustado) {
            return resumo;
        }

        lerAjustes().forEach(ajuste => {

            let quantidadeRestante = Number(ajuste.quantity) || 0;
            let valorRestante = Number(ajuste.amount) || 0;

            resumo.forEach(carteira => {

                if (quantidadeRestante <= EPS || !Array.isArray(carteira.ativos)) {
                    return;
                }

                const item = carteira.ativos.find(
                    a => a.simbolo_ativo === ajuste.asset
                );

                if (!item) {
                    return;
                }

                const quantidade = Number(item.quantidade_item) || 0;

                const custoTotal =
                    quantidade * (Number(item.preco_medio_item) || 0);

                const tirarQuantidade = Math.min(quantidade, quantidadeRestante);

                const tirarCusto = Math.min(custoTotal, valorRestante);

                const novaQuantidade = quantidade - tirarQuantidade;

                if (novaQuantidade <= EPS) {

                    carteira.ativos = carteira.ativos.filter(a => a !== item);

                } else {

                    item.quantidade_item = novaQuantidade;

                    item.preco_medio_item =
                        (custoTotal - tirarCusto) / novaQuantidade;
                }

                quantidadeRestante -= tirarQuantidade;
                valorRestante -= tirarCusto;
            });
        });

        resumo.__ajustado = true;

        return resumo;
    }


    if (
        typeof ResumoCarteiras !== "undefined" &&
        typeof ResumoCarteiras.load === "function"
    ) {

        const carregarOriginal = ResumoCarteiras.load;

        ResumoCarteiras.load = async function (...args) {

            const resumo = await carregarOriginal.apply(this, args);

            return aplicarAjustes(resumo);
        };
    }

})();