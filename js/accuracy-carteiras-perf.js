/* ACC_PERF_CARTEIRAS_V1 - coalescencia de requisicoes identicas em andamento */
(function () {
    "use strict";
    const pendentes = new Map();
    const originalFetch = (...args) => window.fetch(...args);

    function buscar(url, opcoes = {}) {
        const endereco = String(url || "");
        const metodo = String(opcoes.method || "GET").toUpperCase();
        const compartilhavel = metodo === "GET" &&
            /^https:\/\/accuracyappapi\.onrender\.com\/carteiras\/(buscar-carteiras|buscar-posicoes)(?:\?|$)/.test(endereco);

        if (!compartilhavel) return originalFetch(url, opcoes);

        const cab = opcoes.headers || {};
        const auth = cab instanceof Headers
            ? (cab.get("Authorization") || "")
            : (cab.Authorization || cab.authorization || "");
        // A chave existe apenas na memoria durante a requisicao.
        const chave = metodo + "|" + endereco + "|" + auth;
        let tarefa = pendentes.get(chave);
        if (!tarefa) {
            tarefa = originalFetch(url, opcoes);
            pendentes.set(chave, tarefa);
            const limpar = () => {
                if (pendentes.get(chave) === tarefa) pendentes.delete(chave);
            };
            tarefa.then(limpar, limpar);
        }
        // Cada consumidor recebe seu proprio body (Response so pode ser lido uma vez).
        return tarefa.then(resposta => resposta.clone());
    }
    window.AccuracyPerf = { fetch: buscar };
})();