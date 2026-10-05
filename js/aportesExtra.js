/* =========================================================
   APORTES - ACRÉSCIMOS (carregar DEPOIS do Aportes.js)

   Não altera o Aportes.js. Este arquivo só troca a forma
   de carregar os aportes para:

   1. usar a rota nova /aportes/historico-aportes, que traz
      data, carteira e observação de TODOS os aportes
      (corrige "Total aportado este mês" e o "-" na data);
   2. buscar a cotação de TODOS os ativos listados
      (corrige o XPML11 sem o "Hoje: ... (+0,00%)");
   3. mostrar a animação de carregamento.
========================================================= */

(function () {

    "use strict";

    const painelLista = document.getElementById("contributionList")
        ? document.getElementById("contributionList").parentElement
        : null;

    const painelCards = document.querySelector(".cards-top");


    /* Spinner já na abertura da página */
    Loading.on(painelLista);
    Loading.on(painelCards);


    function mostrarCarregando() {
        Loading.on(painelLista);
        Loading.on(painelCards);
    }

    function esconderCarregando() {
        Loading.off(painelLista);
        Loading.off(painelCards);
    }


    /* Mesma tradução de recorrência que o Aportes.js já usa */
    function traduzirRecorrencia(texto) {

        if (texto === "Semanal") {
            return "weekly";
        }

        if (texto === "Mensal") {
            return "monthly";
        }

        return "none";
    }


    /* Substitui a função que busca os aportes */
    carregarAportesAPI = async function () {

        const token = getToken();

        if (!token) {

            console.error("Token não encontrado.");

            esconderCarregando();

            return;
        }

        mostrarCarregando();

        try {

            const response = await fetch(
                `${API_BASE_URL}/aportes/historico-aportes`,
                {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            const text = await response.text();

            let data;

            try {
                data = JSON.parse(text);
            } catch {
                throw new Error(
                    `A API retornou uma resposta inválida (HTTP ${response.status}).`
                );
            }

            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("usuario");

                window.location.href = "login.php";

                return;
            }

            if (!response.ok || data.sucesso !== true) {
                throw new Error(
                    data.mensagem ||
                    data.message ||
                    `Erro HTTP ${response.status}.`
                );
            }

            contributions = (data.aportes || []).map(item => ({

                id: item.id_aporte,

                asset: item.ativo_aporte,

                category: item.categoria_ativo,

                walletId: item.id_carteira,

                amount: Number(item.valor_aporte),

                type: item.tipo_aporte,

                date: item.data_aporte || null,

                recurrence: traduzirRecorrencia(item.recorrencia_aporte),

                recurrenceDay: null,

                observation: item.observacao_aporte || "",

                active: true,

                unitPrice:
                    Number(item.quantidade_aporte) > 0
                        ? Number(item.valor_aporte) /
                        Number(item.quantidade_aporte)
                        : 0
            }));


            /* Mostra a lista já, sem esperar as cotações */
            render();

            esconderCarregando();


            /* Cotação de TODOS os ativos da lista (não só o do formulário) */
            if (typeof Cotacoes !== "undefined") {

                const simbolos = [
                    ...new Set(contributions.map(item => item.asset))
                ];

                const cotacoes = await Cotacoes.fetch(simbolos);

                Object.assign(quotes, cotacoes);

                render();
            }

            return data;

        } finally {

            esconderCarregando();
        }
    };


    /* Começa a carregar logo na abertura, sem esperar a 1ª cotação */
    carregarAportesAPI().catch(error => {

        console.error("Erro ao carregar aportes:", error);

        esconderCarregando();
    });

})();