/* =========================================================
   RESUMO DAS CARTEIRAS

   Busca as carteiras já calculadas pela API (/carteiras/resumo):
   patrimônio, custo, rentabilidade, posições com preço atual e
   os totais do usuário. O site só exibe esses números; nenhuma
   regra financeira é recalculada aqui.

   ResumoCarteiras.load()        -> lista de carteiras
   ResumoCarteiras.loadResumo()  -> resposta completa (com totais)
========================================================= */

const ResumoCarteiras = (function () {

    "use strict";

    const TEMPO_REUSO_MS = 15 * 1000;

    let emAndamento = null;
    let ultimo = null;
    let ultimoEm = 0;

    /* Formato usado pelas telas: mantém os campos antigos (quantidade_item,
       preco_medio_item) e acrescenta os calculados pela API. */
    function normalizarCarteira(carteira) {
        return {
            ...carteira,
            meta_carteira: Number(carteira.meta_carteira) || 0,
            saldo_livre_carteira: Number(carteira.saldo_livre_carteira) || 0,
            ativos: (carteira.ativos || []).map(ativo => ({
                ...ativo,
                quantidade_item: Number(ativo.quantidade) || 0,
                preco_medio_item: Number(ativo.preco_medio) || 0,
                preco_atual: Number(ativo.preco_atual) || 0
            }))
        };
    }

    async function buscar() {
        const token = localStorage.getItem("token");

        if (!token) {
            return null;
        }

        const resposta = await fetch(`${window.ACCURACY_API_URL}/carteiras/resumo`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.success !== true) {
            throw new Error(dados.message || `Não foi possível carregar as carteiras (HTTP ${resposta.status}).`);
        }

        return { ...dados, carteiras: (dados.carteiras || []).map(normalizarCarteira) };
    }

    /* Várias partes da página pedem o resumo ao mesmo tempo: uma única
       requisição atende todas, e o resultado é reaproveitado por alguns segundos. */
    function loadResumo(opcoes = {}) {
        if (!opcoes.force && ultimo && Date.now() - ultimoEm < TEMPO_REUSO_MS) {
            return Promise.resolve(ultimo);
        }

        if (!emAndamento) {
            emAndamento = buscar()
                .then(resultado => {
                    ultimo = resultado;
                    ultimoEm = Date.now();
                    return resultado;
                })
                .finally(() => {
                    emAndamento = null;
                });
        }

        return emAndamento;
    }

    async function load(opcoes = {}) {
        const resumo = await loadResumo(opcoes);
        return resumo ? resumo.carteiras : [];
    }

    return { load, loadResumo };

})();
