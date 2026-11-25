/* =========================================================
   SHELL DA ÁREA LOGADA

   - V2Fmt   : formatadores (R$, %).
   - V2Toast : aviso rápido no canto da tela.
   - V2Dados : carteiras e totais calculados pela API, no formato
               usado pelas telas (carregado uma vez e compartilhado).
   - Topo    : saldo disponível (saldo geral da conta).
   - Menu    : gaveta lateral no celular.
   - Depósito simulado no saldo geral.

   Carregue DEPOIS de resumoCarteiras.js.
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
        toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
    }

    window.V2Toast = toast;


    /* =========================
       DADOS COMPARTILHADOS
    ========================= */

    /* Converte o resumo da API para o formato das telas (carteira -> ativos). */
    function montar(resumo) {
        const carteiras = (resumo ? resumo.carteiras : []).map(c => {
            const simulada = c.tipo_carteira === "Simulada";

            const ativos = c.ativos.map(a => {
                const temCotacao = a.origem_preco !== "custo";

                return {
                    ...a,
                    cotacao: temCotacao ? a.preco_atual : null,
                    temCotacao,
                    custo: a.valor_investido,
                    posicao: a.valor_atual,
                    rent: temCotacao ? a.rentabilidade_percentual : null
                };
            });

            let rent = null;
            if (simulada && c.capital_simulado > 0) {
                rent = c.rentabilidade_simulacao;
            } else if (!simulada && c.total_investido > 0) {
                rent = c.rentabilidade_percentual;
            }

            return {
                ...c,
                ativos,
                custo: c.total_investido,
                posicoes: c.valor_mercado,
                valor: c.patrimonio_atual,
                rent
            };
        });

        const real = resumo ? resumo.real : null;

        return {
            carteiras,
            resumo,
            saldo: resumo ? resumo.saldo_geral : 0,
            total: real ? real.patrimonio_total : 0,
            rent: real && real.total_investido > 0 ? real.rentabilidade_percentual : null
        };
    }

    async function carregar(opcoes = {}) {
        if (typeof ResumoCarteiras === "undefined") {
            return montar(null);
        }

        const dados = montar(await ResumoCarteiras.loadResumo({ force: Boolean(opcoes.force) }));

        if (typeof opcoes.onParcial === "function") {
            opcoes.onParcial(dados);
        }

        return dados;
    }

    window.V2Dados = {
        carregar,
        refresh: opcoes => carregar({ ...opcoes, force: true })
    };


    /* =========================
       TOPO E SIDEBAR
    ========================= */

    function pintarSaldo(valor) {
        ["v2Total", "v2Saldo"].forEach(id => {
            const el = document.getElementById(id);

            if (el) {
                el.textContent = brl(valor);
                el.classList.remove("carregando-texto");
            }
        });
    }

    function publicar(dados) {
        pintarSaldo(dados.saldo);
        window.dispatchEvent(new CustomEvent("accuracy:resumo-atualizado", { detail: dados }));
    }


    /* =========================
       MENU NO CELULAR
    ========================= */

    function configurarMenu() {
        const botao = document.getElementById("v2MenuBtn");
        const menu = document.getElementById("v2Sidebar");
        const fundo = document.getElementById("v2MenuFundo");

        if (!botao || !menu || !fundo) {
            return;
        }

        function alternar(aberto) {
            menu.classList.toggle("aberto", aberto);
            fundo.hidden = !aberto;
            botao.setAttribute("aria-expanded", String(aberto));
            document.body.classList.toggle("v2-sem-rolagem", aberto);

            if (aberto) {
                const primeiro = menu.querySelector("a");
                if (primeiro) primeiro.focus();
            }
        }

        botao.addEventListener("click", () => alternar(!menu.classList.contains("aberto")));
        fundo.addEventListener("click", () => alternar(false));

        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && menu.classList.contains("aberto")) {
                alternar(false);
                botao.focus();
            }
        });

        window.matchMedia("(min-width: 861px)").addEventListener("change", e => {
            if (e.matches) alternar(false);
        });
    }


    /* =========================
       DEPÓSITO SIMULADO
    ========================= */

    let dialogoDeposito = null;
    let depositando = false;

    async function buscarSaldo() {
        const token = localStorage.getItem("token");

        if (!token) {
            return 0;
        }

        const resposta = await fetch(`${window.ACCURACY_API_URL}/carteiras/saldo`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });
        const dados = await resposta.json();

        return resposta.ok && dados.success === true ? Number(dados.saldo_atual) || 0 : 0;
    }

    /* "1.500,50" ou "1500.5" -> "1500.50"; null se inválido */
    function valorCanonico(texto) {
        const limpo = String(texto || "").trim().replace(/\s|R\$/g, "");
        const canonico = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;

        return /^\d{1,13}(\.\d{1,2})?$/.test(canonico) && Number(canonico) > 0
            ? Number(canonico).toFixed(2)
            : null;
    }

    function abrirDeposito() {
        if (dialogoDeposito) {
            dialogoDeposito.querySelector("input").focus();
            return;
        }

        const fundo = document.createElement("div");
        fundo.className = "v2-modal-fundo";
        fundo.innerHTML = `
            <section class="v2-modal" role="dialog" aria-modal="true" aria-labelledby="v2DepositoTitulo">
                <div class="v2-modal-topo">
                    <h2 id="v2DepositoTitulo">Adicionar saldo</h2>
                    <button type="button" class="v2-modal-fechar" aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
                </div>
                <p class="v2-modal-sub">Dinheiro fictício para investir nas carteiras reais.</p>
                <div class="v2-modal-destaque">
                    <small>Saldo atual da conta</small>
                    <strong id="v2DepositoSaldo" class="carregando-texto">Consultando...</strong>
                </div>
                <form novalidate>
                    <label for="v2DepositoValor">Valor do depósito</label>
                    <input id="v2DepositoValor" type="text" inputmode="decimal" autocomplete="off" placeholder="Ex.: 500,00" maxlength="18">
                    <div class="v2-modal-sugestoes">
                        <button type="button" data-valor="100">R$ 100</button>
                        <button type="button" data-valor="500">R$ 500</button>
                        <button type="button" data-valor="1000">R$ 1.000</button>
                    </div>
                    <p class="v2-modal-erro" role="alert" aria-live="polite"></p>
                    <button class="v2-modal-confirmar" type="submit">Confirmar depósito</button>
                </form>
                <p class="v2-modal-aviso">Operação simulada: nenhum dinheiro de verdade é movimentado.</p>
            </section>`;

        document.body.appendChild(fundo);
        dialogoDeposito = fundo;

        const entrada = fundo.querySelector("input");
        const erro = fundo.querySelector(".v2-modal-erro");
        const confirmar = fundo.querySelector(".v2-modal-confirmar");
        const saldoEl = fundo.querySelector("#v2DepositoSaldo");

        function fechar() {
            if (depositando) return;
            fundo.remove();
            dialogoDeposito = null;
        }

        fundo.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });
        fundo.addEventListener("click", e => { if (e.target === fundo) fechar(); });
        fundo.querySelector(".v2-modal-fechar").addEventListener("click", fechar);
        fundo.querySelectorAll("[data-valor]").forEach(b => b.addEventListener("click", () => {
            entrada.value = b.dataset.valor;
            erro.textContent = "";
            entrada.focus();
        }));

        buscarSaldo()
            .then(saldo => { saldoEl.textContent = brl(saldo); })
            .catch(() => { saldoEl.textContent = "—"; })
            .finally(() => saldoEl.classList.remove("carregando-texto"));

        fundo.querySelector("form").addEventListener("submit", async e => {
            e.preventDefault();
            if (depositando) return;

            const valor = valorCanonico(entrada.value);

            if (!valor) {
                erro.textContent = "Informe um valor maior que R$ 0,00 (até 2 casas decimais).";
                entrada.focus();
                return;
            }

            depositando = true;
            confirmar.disabled = true;
            confirmar.textContent = "Adicionando...";
            erro.textContent = "";

            try {
                const resposta = await fetch(
                    `${window.ACCURACY_API_URL}/carteiras/adicionar-saldo?valor=${encodeURIComponent(valor)}`,
                    { method: "POST", headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                const dados = await resposta.json();

                if (!resposta.ok || dados.success !== true) {
                    throw new Error(dados.message || `Erro HTTP ${resposta.status}`);
                }

                depositando = false;
                fechar();
                toast(`${brl(valor)} adicionados ao seu saldo.`);
                atualizar(true);
            } catch (falha) {
                erro.textContent = falha.message || "Não foi possível adicionar saldo.";
                confirmar.textContent = "Confirmar depósito";
                confirmar.disabled = false;
                depositando = false;
            }
        });

        entrada.focus();
    }


    /* =========================
       INÍCIO
    ========================= */

    let atualizando = false;

    async function atualizar(forcar = false) {
        if (atualizando || document.visibilityState === "hidden") return;
        atualizando = true;

        try {
            publicar(await carregar({ force: forcar }));
        } catch (erro) {
            console.error("Não foi possível atualizar o resumo:", erro);
        } finally {
            atualizando = false;
        }
    }

    function iniciar() {
        configurarMenu();

        document.querySelectorAll("#v2AddSaldo, [data-v2-saldo]").forEach(botao => {
            botao.addEventListener("click", abrirDeposito);
        });

        window.V2AbrirDeposito = abrirDeposito;
        window.V2Atualizar = () => atualizar(true);

        // Volta para a aba ou janela: confere se algo mudou (ex.: operação feita no app).
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") atualizar(true);
        });

        atualizar();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", iniciar);
    } else {
        iniciar();
    }

})();
