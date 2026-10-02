/* =========================
   COTAÇÕES (compartilhado)
   Usado por Aportes e Carteira.

   Cotacoes.fetch(["PETR4","Bitcoin"])
   -> { PETR4: 38.5, Bitcoin: 350000 }

   Ativo sem cotação (CDB, Outro)
   não aparece no resultado.
========================= */

const Cotacoes = (function () {

    /*
     * API hospedada
     */
    const API_URL =
        "https://accuracyappapi.onrender.com/quotes/getQuote.php";


    /*
     * Tempo de cache:
     * 60 segundos
     */
    const TTL =
        60 * 1000;


    /*
     * Cache das cotações
     *
     * {
     *   PETR4: {
     *      price: 49.77,
     *      at: 123456789
     *   }
     * }
     */
    const cache = {};


    /* =========================
       BUSCAR COTAÇÕES
    ========================= */

    async function fetchQuotes(symbols) {

        /*
         * Remove símbolos repetidos
         * e vazios.
         */
        const wanted =
            [...new Set(symbols)]
                .filter(Boolean);


        /*
         * Descobre quais símbolos
         * precisam de nova consulta.
         */
        const missing =
            wanted.filter(symbol => {

                const hit =
                    cache[symbol];


                return (
                    !hit ||
                    Date.now() - hit.at > TTL
                );

            });


        /*
         * Busca apenas o que não
         * está no cache.
         */
        if (missing.length) {

            /*
             * A API possui um endpoint
             * por símbolo:
             *
             * /getQuote.php?symbol=PETR4
             */
            for (const symbol of missing) {

                try {

                    const response =
                        await fetch(
                            `${API_URL}?symbol=${encodeURIComponent(
                                symbol
                            )}`
                        );


                    /*
                     * Verifica HTTP
                     */
                    if (!response.ok) {

                        throw new Error(
                            `HTTP ${response.status}`
                        );

                    }


                    /*
                     * Converte resposta
                     * para JSON
                     */
                    const data =
                        await response.json();


                    /*
                     * Formato retornado
                     * pela sua API:
                     *
                     * {
                     *   results: [
                     *     {
                     *       symbol: "PETR4",
                     *       data: {
                     *         regularMarketPrice: 49.77
                     *       }
                     *     }
                     *   ]
                     * }
                     */

                    const ativo =
                        data.results &&
                        data.results[0];


                    const preco =
                        ativo &&
                        ativo.data &&
                        ativo.data.regularMarketPrice;


                    /*
                     * Se encontrou a cotação,
                     * salva no cache.
                     */
                    if (
                        preco !== null &&
                        preco !== undefined
                    ) {

                        const price =
                            Number(preco);


                        cache[symbol] = {

                            price,

                            at:
                                Date.now()

                        };

                    }


                } catch (error) {

                    console.error(
                        `Erro ao buscar cotação de ${symbol}:`,
                        error
                    );

                }

            }

        }


        /*
         * Monta o resultado no mesmo
         * formato que o restante
         * do seu site já espera:
         *
         * {
         *   PETR4: 49.77
         * }
         */

        const result = {};


        wanted.forEach(symbol => {

            if (
                cache[symbol] &&
                cache[symbol].price !== null &&
                cache[symbol].price !== undefined
            ) {

                result[symbol] =
                    cache[symbol].price;

            }

        });


        return result;

    }


    /* =========================
       WATCH
       Chama agora e a cada 60s
    ========================= */

    function watch(
        getSymbols,
        callback
    ) {

        const run =
            async () => {

                try {

                    const symbols =
                        getSymbols();


                    const result =
                        await fetchQuotes(
                            symbols
                        );


                    callback(result);


                } catch (error) {

                    console.error(
                        "Erro ao atualizar cotações:",
                        error
                    );

                }

            };


        /*
         * Executa imediatamente
         */
        run();


        /*
         * Depois atualiza a cada
         * 60 segundos
         */
        return setInterval(
            run,
            TTL
        );

    }


    /*
     * Mantém exatamente a mesma
     * interface usada pelo site.
     */
    return {

        fetch:
            fetchQuotes,

        watch

    };

})();