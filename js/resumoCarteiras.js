//Usado pela tela Carteira e pelo Dashboard.


const ResumoCarteiras = (function () {

    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    // mesma classificação usada em Aportes.js (a API de posições não devolve a categoria)
    const CLASSES = {
        PETR4: "Ações",
        Bitcoin: "Cripto",
        "CDB Nubank": "Renda Fixa",
        XPML11: "FIIs"
    };

    async function get(caminho, token) {
        const response = await fetch(`${API_BASE_URL}${caminho}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const texto = await response.text();

        let data;

        try {
            data = JSON.parse(texto);
        } catch (erro) {
            console.error("Resposta recebida da API:", texto);
            throw new Error(`A API não retornou JSON. HTTP ${response.status}`);
        }

        if (!response.ok || !data.sucesso) {
            throw new Error(
                data.mensagem ||
                data.erro ||
                `HTTP ${response.status}`
            );
        }

        return data;
    }

    async function load() {

        const token = localStorage.getItem("token");

        if (!token) {
            return [];
        }

        try {

            const { carteiras } = await get("/user/carteira.php", token);

            return await Promise.all((carteiras || []).map(async carteira => {

                let posicoes = [];

                try {

                    const data = await get(
                        `/user/itemInvestimento.php?id_carteira=${encodeURIComponent(carteira.id_carteira)}`,
                        token
                    );

                    posicoes = data.posicoes || [];

                } catch (error) {

                    console.error(`Erro ao buscar posições da carteira ${carteira.id_carteira}:`, error);
                }

                return {
                    id_carteira: carteira.id_carteira,
                    nome_carteira: carteira.nome_carteira,
                    saldo_livre_carteira: Number(carteira.saldo_livre_carteira) || 0,

                    ativos: posicoes
                        .filter(p => Number(p.quantidade_item) > 0)
                        .map(p => ({
                            simbolo_ativo: p.simbolo_ativo,
                            nome_ativo: p.nome_ativo,
                            categoria_ativo: CLASSES[p.simbolo_ativo] || "Outros",
                            quantidade_item: Number(p.quantidade_item),
                            preco_medio_item: Number(p.preco_medio_item)
                        }))
                };
            }));

        } catch (error) {

            console.error("Erro ao montar o resumo das carteiras:", error);

            return [];
        }
    }

    return { load };

})();