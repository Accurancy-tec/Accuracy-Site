/* =========================================================
   SHELL V2 (Carteira e Aportes)

   - V2Fmt    : formatadores (R$, %).
   - V2Toast  : aviso rápido no canto da tela.
   - V2Dados  : carteiras + cotações calculadas UMA vez e
                compartilhadas entre o topo, a Carteira e o
                restante da página (cache de 30 s).
   - Topo     : "Total R$ ..." e "Saldo disponível".
   - Busca    : o campo do topo dispara o evento "v2:busca".

   Carregue DEPOIS de resumoCarteiras.js e cotacoes.js.
========================================================= */

(function () {

    "use strict";


    /* =========================
       FORMATAÇÃO
    ========================= */

    const fmtBRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
    const fmtBRL0 = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

    function brl(valor) {
        return fmtBRL.format(Number(valor) || 0);
    }

    function brl0(valor) {
        return fmtBRL0.format(Math.round(Number(valor) || 0));
    }

    /* +9,4%  /  -3,11%  /  0,0% */
    function pct(valor, casas = 1) {

        const n = Number(valor);

        if (!Number.isFinite(n)) {
            return "—";
        }

        const texto = Math.abs(n).toFixed(casas).replace(".", ",");
        const zero = Number(Math.abs(n).toFixed(casas)) === 0;

        return `${zero ? "" : (n > 0 ? "+" : "-")}${texto}%`;
    }

    window.V2Fmt = { brl, brl0, pct };


    /* =========================
       TOAST
    ========================= */

    let toastEl = null;
    let toastTimer = null;

    function toast(mensagem) {

        if (!toastEl) {
            toastEl = document.createElement("div");
            toastEl.className = "v2-toast";
            toastEl.setAttribute("role", "status");
            document.body.appendChild(toastEl);
        }

        toastEl.textContent = mensagem;
        toastEl.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
    }

    window.V2Toast = toast;


    /* =========================
       DADOS COMPARTILHADOS
    ========================= */

    const TTL = 30 * 1000;

    let promessa = null;
    let carregadoEm = 0;
    let parcial = null;
    let ouvintesParcial = [];

    function calcular(carteiras, cotacoes, saldoUsuario = 0) {

        const lista = carteiras.map(c => {

            const ativos = (c.ativos || []).map(a => {

                const cot = cotacoes[a.simbolo_ativo];
                const temCotacao = Number.isFinite(cot);
                const preco = temCotacao ? cot : a.preco_medio_item;

                const custo = a.quantidade_item * a.preco_medio_item;
                const posicao = a.quantidade_item * preco;

                return {
                    ...a,
                    cotacao: temCotacao ? cot : null,
                    temCotacao,
                    custo,
                    posicao,
                    rent: temCotacao && custo > 0 ? ((posicao - custo) / custo) * 100 : null
                };
            });

            const custo = ativos.reduce((s, a) => s + a.custo, 0);
            const posicoes = ativos.reduce((s, a) => s + a.posicao, 0);

            /* rentabilidade só sobre o que tem cotação (renda fixa não tem) */
            const base = ativos.filter(a => a.temCotacao);
            const custoBase = base.reduce((s, a) => s + a.custo, 0);
            const posBase = base.reduce((s, a) => s + a.posicao, 0);

            return {
                ...c,
                ativos,
                custo,
                posicoes,
                valor: posicoes + c.saldo_livre_carteira,
                rent: custoBase > 0 ? ((posBase - custoBase) / custoBase) * 100 : null,
                _custoBase: custoBase,
                _posBase: posBase
            };
        });

        /* o saldo disponível é do usuário (/carteiras/saldo), não de cada carteira */
        const saldo = saldoUsuario + lista.reduce((s, c) => s + c.saldo_livre_carteira, 0);
        const total = lista.reduce((s, c) => s + c.valor, 0) + saldoUsuario;
        const custoBase = lista.reduce((s, c) => s + c._custoBase, 0);
        const posBase = lista.reduce((s, c) => s + c._posBase, 0);

        return {
            carteiras: lista,
            cotacoes,
            total,
            saldo,
            rent: custoBase > 0 ? ((posBase - custoBase) / custoBase) * 100 : null
        };
    }

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    /* saldo disponível do usuário; se falhar, mostra 0 sem quebrar a tela */
    async function buscarSaldo() {

        const token = localStorage.getItem("token");

        if (!token) {
            return 0;
        }

        try {

            const resposta = await fetch(`${API_BASE_URL}/carteiras/saldo`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await resposta.json();

            return resposta.ok && data.success === true
                ? (Number(data.saldo_atual) || 0)
                : 0;

        } catch (erro) {
            console.error("Erro ao buscar o saldo:", erro);
            return 0;
        }
    }

    function carregar(opcoes = {}) {

        const { force = false, onParcial = null } = opcoes;

        if (!force && promessa && Date.now() - carregadoEm < TTL) {

            if (onParcial) {
                if (parcial) {
                    onParcial(parcial);
                } else {
                    ouvintesParcial.push(onParcial);
                }
            }

            return promessa;
        }

        carregadoEm = Date.now();
        parcial = null;
        ouvintesParcial = onParcial ? [onParcial] : [];

        promessa = (async () => {

            if (typeof ResumoCarteiras === "undefined") {
                return calcular([], {});
            }

            const [carteiras, saldoUsuario] = await Promise.all([
                ResumoCarteiras.load(),
                buscarSaldo()
            ]);

            /* 1ª fase: valores pelo preço médio (aparece rápido) */
            parcial = calcular(carteiras, {}, saldoUsuario);
            ouvintesParcial.forEach(fn => fn(parcial));
            ouvintesParcial = [];

            /* 2ª fase: com as cotações atuais */
            const simbolos = [...new Set(carteiras.flatMap(c => c.ativos.map(a => a.simbolo_ativo)))];

            let cotacoes = {};

            if (simbolos.length && typeof Cotacoes !== "undefined") {
                try {
                    cotacoes = await Cotacoes.fetch(simbolos);
                } catch (erro) {
                    console.error("Erro ao buscar cotações:", erro);
                }
            }

            return calcular(carteiras, cotacoes, saldoUsuario);

        })();

        promessa.catch(() => { promessa = null; });

        return promessa;
    }

    window.V2Dados = {
        carregar,
        refresh: opcoes => carregar({ ...opcoes, force: true })
    };


    /* =========================
       TOPO E SIDEBAR
    ========================= */

    function pintarTopo(dados) {

        const total = document.getElementById("v2Total");
        const saldo = document.getElementById("v2Saldo");

        if (total) {
            total.textContent = brl(dados.total);
        }

        if (saldo) {
            saldo.textContent = brl(dados.saldo);
        }
    }

    function iniciar() {

        /* busca do topo -> evento para quem quiser ouvir */
        const busca = document.getElementById("v2Search");

        if (busca) {

            busca.addEventListener("input", () => {
                window.dispatchEvent(new CustomEvent("v2:busca", { detail: busca.value }));
            });

            busca.addEventListener("keydown", e => {

                if (e.key === "Escape" && busca.value) {
                    busca.value = "";
                    busca.dispatchEvent(new Event("input"));
                }

                /* páginas sem busca própria: Enter leva a busca para Aportes */
                if (e.key === "Enter" && document.body.dataset.v2Search !== "local" && busca.value.trim()) {
                    window.location.href = "aportes.php?q=" + encodeURIComponent(busca.value.trim());
                }
            });

            /* permite limpar o campo por código (ex.: botão Voltar) */
            window.addEventListener("v2:busca-limpar", () => {
                busca.value = "";
            });
        }

        /* adicionar saldo: ainda não existe rota na API */
        document.querySelectorAll("#v2AddSaldo, [data-v2-saldo]").forEach(botao => {
            botao.addEventListener("click", () => {
                toast(botao.dataset.v2Saldo === "retirar"
                    ? "Retirar saldo ainda não está disponível."
                    : "Adicionar saldo ainda não está disponível.");
            });
        });

        carregar({ onParcial: pintarTopo }).then(pintarTopo).catch(erro => {
            console.error("Erro ao montar o resumo:", erro);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
