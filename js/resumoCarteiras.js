/*
=========================================================

RESUMO DAS CARTEIRAS

Usado pela tela Carteira e pelo Dashboard.

Busca:

1. Carteiras do usuário
2. Posições de cada carteira

=========================================================
*/

const ResumoCarteiras = (function () {

    "use strict";


    const API_BASE_URL =
        "https://accuracyappapi.onrender.com";


    /*
    =====================================================
    CLASSIFICAÇÃO DOS ATIVOS
    =====================================================
    */

    const CLASSES = {

        PETR4:
            "Ações",

        Bitcoin:
            "Cripto",

        "CDB Nubank":
            "Renda Fixa",

        XPML11:
            "FIIs"

    };


    /*
    =====================================================
    GET
    =====================================================
    */

    async function get(
        caminho,
        token
    ) {

        const response =
            await fetch(

                `${API_BASE_URL}${caminho}`,

                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"

                    }

                }

            );


        const texto =
            await response.text();


        let data;


        try {

            data =
                JSON.parse(texto);

        } catch (erro) {

            console.error(

                "Resposta recebida da API:",
                texto

            );


            throw new Error(

                `A API não retornou JSON. HTTP ${response.status}`

            );
        }


        /*
        A API de carteiras usa "success".

        A API de posições usa "sucesso".

        Por isso aceitamos os dois.
        */

        if (

            !response.ok ||

            (
                data.sucesso !== true &&
                data.success !== true
            )

        ) {

            throw new Error(

                data.mensagem ||

                data.message ||

                data.erro ||

                `HTTP ${response.status}`

            );
        }


        return data;
    }


    /*
    =====================================================
    CARREGAR RESUMO
    =====================================================
    */

    async function load() {

        const token =
            localStorage.getItem(
                "token"
            );


        if (!token) {

            console.warn(
                "Token não encontrado."
            );

            return [];
        }


        try {

            /*
            -------------------------------------------------
            1. BUSCAR CARTEIRAS
            -------------------------------------------------
            */

            const dataCarteiras =
                await get(

                    "/carteiras/buscar-carteiras",

                    token

                );


            const carteiras =
                dataCarteiras.carteiras
                || [];


            /*
            -------------------------------------------------
            2. BUSCAR POSIÇÕES DE CADA CARTEIRA
            -------------------------------------------------
            */

            return await Promise.all(

                carteiras.map(

                    async carteira => {

                        let posicoes = [];


                        try {

                            const data =
                                await get(

                                    `/carteiras/buscar-posicoes?id_carteira=${encodeURIComponent(
                                        carteira.id_carteira
                                    )}`,

                                    token

                                );


                            posicoes =
                                data.posicoes
                                || [];

                        } catch (error) {

                            console.error(

                                `Erro ao buscar posições da carteira ${carteira.id_carteira}:`,

                                error

                            );

                        }


                        /*
                        -------------------------------------------------
                        RETORNO DA CARTEIRA
                        -------------------------------------------------
                        */

                        return {

                            id_carteira:
                                carteira.id_carteira,


                            nome_carteira:
                                carteira.nome_carteira,


                            saldo_livre_carteira:
                                Number(
                                    carteira.saldo_livre_carteira
                                ) || 0,


                            ativos:

                                posicoes

                                    .filter(

                                        p =>
                                            Number(
                                                p.quantidade_item
                                            ) > 0

                                    )

                                    .map(

                                        p => ({

                                            simbolo_ativo:
                                                p.simbolo_ativo,


                                            nome_ativo:
                                                p.nome_ativo,


                                            categoria_ativo:
                                                CLASSES[
                                                    p.simbolo_ativo
                                                ]
                                                || "Outros",


                                            quantidade_item:
                                                Number(
                                                    p.quantidade_item
                                                ),


                                            preco_medio_item:
                                                Number(
                                                    p.preco_medio_item
                                                )

                                        })

                                    )

                        };

                    }

                )

            );

        } catch (error) {

            console.error(

                "Erro ao montar o resumo das carteiras:",

                error

            );


            return [];
        }
    }


    /*
    =====================================================
    EXPORTAÇÃO
    =====================================================
    */

    return {

        load

    };

})();