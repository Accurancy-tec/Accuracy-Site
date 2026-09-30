/* =========================
   COTAÇÕES (compartilhado)
   Usado por Aportes e Carteira.

   Cotacoes.fetch(["PETR4","Bitcoin"]) -> { PETR4: 38.5, Bitcoin: 350000 }
   Ativo sem cotação (CDB, Outro) não aparece no resultado.
========================= */

const Cotacoes = (function () {

    const API_URL = "http://localhost/accuracyAppApi/quotes/getQuotes.php";
    const TTL = 60 * 1000;

    const cache = {};   // { simbolo: { price, at } }

    async function fetchQuotes(symbols) {

        const wanted = [...new Set(symbols)].filter(Boolean);

        const missing = wanted.filter(s => {
            const hit = cache[s];
            return !hit || Date.now() - hit.at > TTL;
        });

        if (missing.length) {

            try {

                const response = await fetch(
                    `${API_URL}?symbols=${encodeURIComponent(missing.join(","))}`,
                    { headers: { Authorization: "Bearer " + localStorage.getItem("token") } }
                );

                const data = await response.json();

                if (data.success) {
                    missing.forEach(s => {
                        cache[s] = {
                            price: data.quotes[s] ? data.quotes[s].price : null,
                            at: Date.now()
                        };
                    });
                }

            } catch (error) {
                console.error("Erro ao buscar cotações:", error);
            }

        }

        const result = {};

        wanted.forEach(s => {
            if (cache[s] && cache[s].price !== null) {
                result[s] = cache[s].price;
            }
        });

        return result;

    }

    /* Chama callback agora e a cada 60s */

    function watch(getSymbols, callback) {

        const run = async () => callback(await fetchQuotes(getSymbols()));

        run();

        return setInterval(run, TTL);

    }

    return { fetch: fetchQuotes, watch };

})();