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
        "https://accuracyappapi.onrender.com/brapi/get-quote";

    /*
     * Cripto e futuros têm rota própria de cotação.
     * A rota de cada símbolo vem de:
     *   1. window.ASSET_ROTA (preenchido ao escolher o ativo em Aportes)
     *   2. localStorage (lembrado entre páginas)
     *   3. tentativa automática: ação -> cripto -> futuros
     */
    const ROTAS_URL = {
        acao: "get-quote",
        cripto: "get-crypto-quote",
        futuros: "get-futures-quote"
    };

    const ROTAS_KEY = "accuracy_rotas_cotacao";

    /* só símbolos com cara de ticker entram na tentativa automática
       (títulos de renda fixa, com espaços, nunca chegam à API) */
    const PADRAO_TICKER = /^[A-Z0-9.^_-]{2,24}$/;

    function lerRotas() {
        try {
            return JSON.parse(localStorage.getItem(ROTAS_KEY)) || {};
        } catch {
            return {};
        }
    }

    function lembrarRota(symbol, tipo) {
        try {
            const rotas = lerRotas();

            if (rotas[symbol] === tipo) {
                return;
            }

            rotas[symbol] = tipo;
            localStorage.setItem(ROTAS_KEY, JSON.stringify(rotas));
        } catch {
            /* sem localStorage: só perde a memória entre páginas */
        }
    }

    function rotaConhecida(symbol) {
        return (window.ASSET_ROTA || {})[symbol] || lerRotas()[symbol] || null;
    }

    async function consultar(tipo, symbol) {
        const url = API_URL.replace(/get-quote$/, ROTAS_URL[tipo]);

        const response = await fetch(
            `${url}?symbol=${encodeURIComponent(symbol)}`
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        const ativo = data.results && data.results[0];

        const preco = ativo && ativo.data && ativo.data.regularMarketPrice;

        if (preco === null || preco === undefined || !isFinite(Number(preco))) {
            throw new Error("Sem preço");
        }

        return Number(preco);
    }

    /* Devolve o preço do símbolo, ou null se nenhuma rota respondeu */
    async function buscarPreco(symbol) {

        const conhecida = rotaConhecida(symbol);

        let tentativas;

        if (conhecida) {
            tentativas = [conhecida];
        } else if (PADRAO_TICKER.test(symbol)) {
            tentativas = ["acao", "cripto", "futuros"];
        } else {
            tentativas = ["acao"];
        }

        let ultimoErro = null;

        for (const tipo of tentativas) {
            try {
                const preco = await consultar(tipo, symbol);

                if (tipo !== "acao") {
                    lembrarRota(symbol, tipo);
                }

                return preco;

            } catch (erro) {
                ultimoErro = erro;
            }
        }

        console.error(`Erro ao buscar cotação de ${symbol}:`, ultimoErro);

        return null;
    }


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

                const price = await buscarPreco(symbol);

                if (price !== null) {

                    cache[symbol] = {

                        price,

                        at:
                            Date.now()

                    };

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