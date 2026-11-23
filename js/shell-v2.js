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
            total.textContent = brl(dados.saldo);
        }

        if (saldo) {
            saldo.textContent = brl(dados.saldo);
        }
    }

    /* =========================
       DEPOSITO SIMULADO
    ========================= */

    let depositoEmAndamento = false;
    let dialogoDeposito = null;

    function abrirDeposito() {
        if (dialogoDeposito) {
            dialogoDeposito.querySelector("#v2DepositoValor").focus();
            return;
        }

        if (!localStorage.getItem("token")) {
            toast("Entre na sua conta para adicionar saldo.");
            return;
        }

        if (!document.getElementById("v2DepositoEstilos")) {
            const estilos = document.createElement("style");
            estilos.id = "v2DepositoEstilos";
            estilos.textContent = `
                .v2-deposito-fundo { position:fixed; inset:0; z-index:10050; background:rgba(2,8,23,.78); display:flex; align-items:center; justify-content:center; padding:18px; backdrop-filter:blur(5px); }
                .v2-deposito-modal { width:min(100%,430px); background:#0e1f3d; border:1px solid #2b456e; border-radius:20px; color:#f8fbff; padding:26px; box-shadow:0 26px 85px rgba(0,0,0,.48); font-family:inherit; }
                .v2-deposito-topo { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:8px; }
                .v2-deposito-topo h2 { font-size:21px; line-height:1.3; margin:0; color:white; }
                .v2-deposito-fechar { border:0; background:#172e50; color:#e4ebff; border-radius:9px; width:34px; height:34px; font-size:23px; cursor:pointer; }
                .v2-deposito-subtitulo { color:#9fb5d8; margin:0 0 18px; font-size:13px; line-height:1.5; }
                .v2-deposito-saldo { padding:15px; background:#102a51; border:1px solid #29466e; border-radius:12px; margin-bottom:18px; }
                .v2-deposito-saldo small { display:block; color:#adc1df; margin-bottom:5px; }
                .v2-deposito-saldo strong { color:white; font-size:24px; }
                .v2-deposito-modal label { display:block; margin-bottom:8px; font-size:14px; font-weight:600; color:#e9f0ff; }
                .v2-deposito-modal input { box-sizing:border-box; width:100%; padding:14px 15px; color:white; font-size:18px; border:1px solid #3a5681; border-radius:10px; background:#0a182e; outline:none; }
                .v2-deposito-modal input:focus { border-color:#4b89ff; box-shadow:0 0 0 3px rgba(59,130,246,.2); }
                .v2-deposito-sugestoes { display:flex; flex-wrap:wrap; gap:8px; margin:12px 0; }
                .v2-deposito-sugestoes button { cursor:pointer; padding:8px 13px; border:1px solid #304e7a; background:#12294c; border-radius:999px; color:#dbeafe; }
                .v2-deposito-erro { color:#ff96a6; min-height:20px; font-size:13px; margin:8px 0; }
                .v2-deposito-confirmar { width:100%; padding:14px; border:0; border-radius:11px; font-size:15px; font-weight:700; color:white; background:#2563eb; cursor:pointer; }
                .v2-deposito-confirmar:disabled { cursor:not-allowed; opacity:.65; }
                .v2-deposito-aviso { font-size:12px; line-height:1.5; color:#9fb5d8; margin:14px 0 0; }
            `;
            document.head.appendChild(estilos);
        }

        const fundo = document.createElement("div");
        fundo.className = "v2-deposito-fundo";
        fundo.innerHTML = `
            <section class="v2-deposito-modal" role="dialog" aria-modal="true" aria-labelledby="v2DepositoTitulo">
                <div class="v2-deposito-topo">
                    <h2 id="v2DepositoTitulo">Adicionar saldo</h2>
                    <button type="button" class="v2-deposito-fechar" aria-label="Fechar">×</button>
                </div>
                <p class="v2-deposito-subtitulo">Adicione dinheiro fictício à sua conta Accuracy.</p>
                <div class="v2-deposito-saldo"><small>Saldo atual da conta</small><strong id="v2DepositoSaldo">Consultando...</strong></div>
                <form id="v2DepositoForm" novalidate>
                    <label for="v2DepositoValor">Valor do depósito (R$)</label>
                    <input id="v2DepositoValor" type="text" inputmode="decimal" autocomplete="off" placeholder="Ex.: 500,00" required maxlength="18">
                    <div class="v2-deposito-sugestoes">
                        <button type="button" data-valor="100">R$ 100</button>
                        <button type="button" data-valor="500">R$ 500</button>
                        <button type="button" data-valor="1000">R$ 1.000</button>
                    </div>
                    <p id="v2DepositoErro" class="v2-deposito-erro" role="alert" aria-live="polite"></p>
                    <button class="v2-deposito-confirmar" id="v2DepositoConfirmar" type="submit">Confirmar depósito simulado</button>
                </form>
                <p class="v2-deposito-aviso">Operação simulada: não há movimentação de dinheiro real.</p>
            </section>`;

        document.body.appendChild(fundo);
        dialogoDeposito = fundo;
        const entrada = fundo.querySelector("#v2DepositoValor");
        const erroEl = fundo.querySelector("#v2DepositoErro");
        const confirmar = fundo.querySelector("#v2DepositoConfirmar");
        const fechar = () => {
            if (depositoEmAndamento) return;
            fundo.removeEventListener("keydown", teclas);
            fundo.remove();
            dialogoDeposito = null;
        };
        const teclas = e => { if (e.key === "Escape") fechar(); };
        fundo.addEventListener("keydown", teclas);
        fundo.querySelector(".v2-deposito-fechar").addEventListener("click", fechar);
        fundo.addEventListener("click", e => { if (e.target === fundo) fechar(); });
        fundo.querySelectorAll("[data-valor]").forEach(b => {
            b.addEventListener("click", () => {
                entrada.value = b.dataset.valor;
                erroEl.textContent = "";
                entrada.focus();
            });
        });

        // O saldo da API e o saldo livre de uma carteira podem ser diferentes.
        buscarSaldo().then(saldo => {
            if (dialogoDeposito === fundo) {
                fundo.querySelector("#v2DepositoSaldo").textContent = brl(saldo);
            }
        });

        fundo.querySelector("#v2DepositoForm").addEventListener("submit", async e => {
            e.preventDefault();
            if (depositoEmAndamento) return;

            const texto = entrada.value.trim().replace(/\s/g, "");
            const canonico = texto.includes(",")
                ? texto.replace(/\./g, "").replace(",", ".")
                : texto;

            if (!/^\d{1,13}(\.\d{1,2})?$/.test(canonico) || Number(canonico) <= 0) {
                erroEl.textContent = "Informe um valor válido, maior que R$ 0,00 (até 2 casas decimais).";
                entrada.focus();
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                erroEl.textContent = "Sessão expirada. Faça login novamente.";
                return;
            }

            depositoEmAndamento = true;
            confirmar.disabled = true;
            confirmar.textContent = "Adicionando saldo...";
            erroEl.textContent = "";

            try {
                // A rota atualmente implementada pelo backend lê $_GET['valor'].
                const url = `${API_BASE_URL}/carteiras/adicionar-saldo?valor=${encodeURIComponent(Number(canonico).toFixed(2))}`;
                const resposta = await fetch(url, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                    cache: "no-store"
                });
                const data = await resposta.json();
                if (!resposta.ok || data.success !== true) {
                    throw new Error(data.message || data.mensagem || `Erro HTTP ${resposta.status}`);
                }

                confirmar.textContent = "Saldo adicionado!";
                fundo.querySelector("#v2DepositoSaldo").textContent = brl(data.saldo_atual);
                toast("Saldo simulado adicionado com sucesso.");
                // Recarrega os resumos em todas as páginas sem deixar saldo em cache.
                window.location.reload();
            } catch (erro) {
                erroEl.textContent = erro.message || "Não foi possível adicionar saldo.";
                confirmar.textContent = "Confirmar depósito simulado";
                confirmar.disabled = false;
            } finally {
                depositoEmAndamento = false;
            }
        });

        entrada.focus();
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

        /* Deposito simulado por meio da rota existente da API */
        document.querySelectorAll("#v2AddSaldo, [data-v2-saldo]").forEach(botao => {
            botao.addEventListener("click", () => {
                if (botao.dataset.v2Saldo === "retirar") {
                    toast("Retirar saldo ainda não está disponível.");
                    return;
                }
                abrirDeposito();
            });
        });

        /* Accuracy: atualizacao automatica do total do topo */
        let atualizandoResumo = false;
        async function atualizarResumoTopo() {
            if (atualizandoResumo || document.visibilityState === "hidden") return;
            atualizandoResumo = true;
            try {
                const dados = await window.V2Dados.refresh();
                pintarTopo(dados);
            } catch (erro) {
                console.error("Falha ao atualizar total do topo:", erro);
            } finally {
                atualizandoResumo = false;
            }
        }
        window.addEventListener("focus", atualizarResumoTopo);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") atualizarResumoTopo();
        });
        window.addEventListener("pageshow", atualizarResumoTopo);
        window.setInterval(atualizarResumoTopo, 30000);
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
