/* ACC_SALDOS_RAPIDOS_V1 - exibe saldos sem esperar posicoes/cotacoes */
(function () {
    "use strict";

    const token = localStorage.getItem("token");
    if (!token) return;

    const CACHE = "accuracy_saldos_rapidos_v1";
    const TEMPO_CACHE = 90 * 1000;
    const moeda = new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"});

    // Identifica a sessao sem salvar o token na copia de saldo.
    let hash = 2166136261;
    for (let i = 0; i < token.length; i++) {
        hash ^= token.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    const chaveSessao = (hash >>> 0).toString(16) + ":" + token.length;

    let saldoDaApi = null;
    let saldoDasCarteiras = null;
    let ultimoValor = null;
    let ultimaConfirmacao = 0;

    const estilo = document.createElement("style");
    estilo.textContent = ".accuracy-saldo-aviso{display:block;font-size:10px;font-weight:500;line-height:1.3;opacity:.78;margin-top:2px}";
    document.head.appendChild(estilo);

    function indicador(el, provisorio) {
        if (!el) return;
        // Nunca mostra aviso textual abaixo do saldo.
        const aviso = el.parentElement && el.parentElement.querySelector(".accuracy-saldo-aviso");
        if (aviso) aviso.remove();
        el.title = provisorio
            ? "Ultimo saldo salvo; consultando valor atualizado"
            : "Saldo disponivel confirmado pela API";
    }
function pintar(valor, provisorio) {
        if (!Number.isFinite(valor) || valor < 0) return;
        // O script TopoSaldo anterior configurou AMBOS como saldo disponivel.
        for (const id of ["v2Total", "v2Saldo"]) {
            const el = document.getElementById(id);
            if (!el) continue;
            el.textContent = moeda.format(valor);
            indicador(el, provisorio);
        }
    }

    function lerCache() {
        try {
            const salvo = JSON.parse(sessionStorage.getItem(CACHE) || "null");
            if (!salvo || salvo.chave !== chaveSessao ||
                !Number.isFinite(salvo.valor) || salvo.valor < 0 ||
                Date.now() - salvo.at > TEMPO_CACHE || salvo.at > Date.now()) return null;
            return salvo;
        } catch (_) { return null; }
    }

    function restaurar() {
        const salvo = lerCache();
        if (!salvo) return;
        ultimoValor = salvo.valor;
        ultimaConfirmacao = salvo.at;
        pintar(ultimoValor, true);
    }

    function confirmar() {
        if (saldoDaApi === null || saldoDasCarteiras === null) return;
        const total = Math.round((saldoDaApi + saldoDasCarteiras) * 100) / 100;
        if (!Number.isFinite(total) || total < 0) return;
        ultimoValor = total;
        ultimaConfirmacao = Date.now();
        pintar(total, false);
        try {
            sessionStorage.setItem(CACHE, JSON.stringify({
                chave: chaveSessao,
                at: ultimaConfirmacao,
                valor: total
            }));
        } catch (_) { /* Modo privado: funciona sem cache. */ }
        window.dispatchEvent(new CustomEvent("accuracy:saldos-rapidos-atualizados", {
            detail: { saldo: total }
        }));
    }

    // O carregamento completo da pagina continua executando normalmente.
    // Estes eventos apenas antecipam os dois saldos exibidos na tela.
    window.addEventListener("accuracy:saldos-consulta-iniciada", () => {
        saldoDaApi = null;
        saldoDasCarteiras = null;
        if (ultimoValor !== null && Date.now() - ultimaConfirmacao <= TEMPO_CACHE) {
            pintar(ultimoValor, true);
        }
    });

    window.addEventListener("accuracy:saldo-api-rapido", evento => {
        const n = Number(evento.detail);
        if (!Number.isFinite(n) || n < 0) return;
        saldoDaApi = n;
        confirmar();
    });

    window.addEventListener("accuracy:saldos-carteiras-rapidas", evento => {
        const lista = evento.detail;
        if (!Array.isArray(lista)) return;
        let soma = 0;
        for (const carteira of lista) {
            const n = Number(carteira.saldo_livre_carteira ?? 0);
            if (!Number.isFinite(n) || n < 0) return;
            soma += n;
        }
        saldoDasCarteiras = soma;
        confirmar();
    });

    // A proxima leitura em qualquer pagina usa apenas cache recente da mesma sessao.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", restaurar, {once: true});
    } else {
        restaurar();
    }

    window.AccuracySaldosRapidos = {
        invalidar() {
            ultimoValor = null;
            ultimaConfirmacao = 0;
            saldoDaApi = null;
            saldoDasCarteiras = null;
            try { sessionStorage.removeItem(CACHE); } catch (_) {}
        }
    };
})();