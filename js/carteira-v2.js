/* =========================================================
   CARTEIRAS

   Cartões das carteiras e o painel da carteira selecionada:
   números calculados pela API, ativos com venda, e, nas
   simuladas, o saldo da simulação com os botões para simular
   um investimento e depositar mais dinheiro fictício.

   Depende de: shell-v2.js (V2Dados, V2Fmt, V2Toast) e carteiras.js.
========================================================= */

(function () {

    "use strict";

    const { brl, brl0, pct } = window.V2Fmt;
    const $ = id => document.getElementById(id);

    const CHAVE_ATIVA = "accuracy_carteira_ativa";
    const CORES = ["#4f8cff", "#f59e0b", "#2dd4bf", "#a78bfa", "#f472b6", "#84cc16"];
    const ROTULOS_ESTILO = { "Renda Variavel": "Renda variável", "Renda Fixa": "Renda fixa" };

    const elCarteiras = $("v2Wallets");
    const elSub = $("v2Sub");
    const elTitulo = $("v2TableTitle");
    const elTag = $("carteiraTag");
    const elNumeros = $("carteiraNumeros");
    const elCorpo = $("v2Body");
    const btnCriar = $("v2CreateBtn");
    const btnExcluir = $("v2DeleteBtn");
    const btnSimular = $("btnSimular");
    const btnDepositar = $("btnDepositarSimulacao");
    const btnAporte = $("btnAporte");

    const fmtQtd = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 });

    let dados = null;
    let ativaId = new URLSearchParams(location.search).get("id");


    /* =========================
       UTILITÁRIOS
    ========================= */

    function esc(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function classeDelta(valor) {
        if (valor === null || valor === undefined || !Number.isFinite(valor) || Math.abs(valor) < 0.05) {
            return "flat";
        }
        return valor > 0 ? "up" : "down";
    }

    function carteiraAtiva() {
        return dados ? dados.carteiras.find(c => String(c.id_carteira) === String(ativaId)) || null : null;
    }

    function definirAtiva(id) {
        ativaId = String(id);
        try {
            localStorage.setItem(CHAVE_ATIVA, ativaId);
        } catch (erro) { /* sem storage: só não lembra a escolha */ }
    }

    function resolverAtiva() {
        const existe = id => id != null && dados.carteiras.some(c => String(c.id_carteira) === String(id));

        if (existe(ativaId)) {
            definirAtiva(ativaId);
            return;
        }

        const salva = localStorage.getItem(CHAVE_ATIVA);
        ativaId = existe(salva) ? String(salva) : (dados.carteiras[0] ? String(dados.carteiras[0].id_carteira) : null);
    }

    async function api(caminho, corpo) {
        const resposta = await fetch(`${window.ACCURACY_API_URL}${caminho}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
            body: JSON.stringify(corpo)
        });
        const json = await resposta.json().catch(() => ({}));

        if (!resposta.ok || (json.success !== true && json.sucesso !== true)) {
            throw new Error(json.message || json.mensagem || `Erro HTTP ${resposta.status}`);
        }
        return json;
    }


    /* =========================
       CARTÕES
    ========================= */

    function cartao(c, i) {
        const meta = Number(c.meta_carteira) || 0;
        const progresso = meta > 0 ? Math.min(100, (c.valor / meta) * 100) : 0;
        const cls = classeDelta(c.rent);
        const seta = cls === "up" ? "▲ " : (cls === "down" ? "▼ " : "");
        const delta = c.rent === null ? (c.ativos.length ? "Sem cotações" : "Sem ativos") : pct(c.rent);
        const estilo = ROTULOS_ESTILO[c.estilo_carteira] || c.estilo_carteira || "";
        const etiqueta = [c.tipo_carteira, estilo].filter(Boolean).join(" · ");
        const selecionada = String(c.id_carteira) === String(ativaId);

        return `
            <button type="button" class="v2-wallet${selecionada ? " selected" : ""}${c.tipo_carteira === "Simulada" ? " simulada" : ""}"
                    style="--c:${CORES[i % CORES.length]}" data-id="${esc(c.id_carteira)}" aria-pressed="${selecionada}">
                <span class="v2-wallet-name">${esc(c.nome_carteira)}</span>
                <span class="v2-wallet-tag">${esc(etiqueta)}</span>
                <span class="v2-wallet-value">${esc(brl0(c.valor))}</span>
                <span class="v2-wallet-delta ${cls}">${c.rent === null ? "" : seta}${esc(delta)}</span>
                <span class="v2-track"><i style="width:${progresso}%"></i></span>
                <span class="v2-wallet-goal">${esc(meta > 0 ? `Meta ${brl0(meta)} · ${Math.round(progresso)}%` : "Sem meta definida")}</span>
            </button>`;
    }

    function desenharCarteiras() {
        const lista = [...dados.carteiras].sort((a, b) => Number(a.id_carteira) - Number(b.id_carteira));

        elCarteiras.innerHTML = lista.map(cartao).join("") +
            '<button type="button" class="v2-wallet v2-wallet-new" data-nova><i class="bi bi-plus-lg" aria-hidden="true"></i> Nova carteira</button>';
    }

    function desenharSubtitulo() {
        const reais = dados.carteiras.filter(c => c.tipo_carteira !== "Simulada");
        const simuladas = dados.carteiras.length - reais.length;

        if (!dados.carteiras.length) {
            elSub.textContent = "Você ainda não tem carteiras. Crie a primeira para começar.";
            return;
        }

        const partes = [];
        if (reais.length) {
            const valorReais = reais.reduce((soma, c) => soma + c.valor, 0);
            partes.push(`${brl(valorReais)} em ${reais.length === 1 ? "1 carteira real" : `${reais.length} carteiras reais`}`);
        }
        if (simuladas) {
            partes.push(simuladas === 1 ? "1 simulação" : `${simuladas} simulações`);
        }
        elSub.textContent = partes.join(" · ");
    }


    /* =========================
       PAINEL DA CARTEIRA
    ========================= */

    function numero(rotulo, valor, classe = "", detalhe = "") {
        return `<div><dt>${esc(rotulo)}</dt><dd class="${classe}">${esc(valor)}${detalhe ? `<small>${esc(detalhe)}</small>` : ""}</dd></div>`;
    }

    function sinal(valor) {
        const cls = classeDelta(valor);
        return cls === "up" ? "positivo" : (cls === "down" ? "negativo" : "");
    }

    function desenharPainel() {
        const c = carteiraAtiva();
        const simulada = c && c.tipo_carteira === "Simulada";

        btnExcluir.hidden = !c;
        btnSimular.hidden = !simulada;
        btnDepositar.hidden = !simulada;
        btnAporte.hidden = !c || simulada;

        if (!c) {
            elTitulo.textContent = "Nenhuma carteira";
            elTag.textContent = "";
            elNumeros.hidden = true;
            elCorpo.innerHTML = '<tr><td colspan="7" class="v2-empty">Crie uma carteira para começar a acompanhar seus investimentos.</td></tr>';
            return;
        }

        elTitulo.textContent = c.nome_carteira;
        elTag.textContent = [c.tipo_carteira, ROTULOS_ESTILO[c.estilo_carteira] || c.estilo_carteira].filter(Boolean).join(" · ");
        elTag.className = `carteira-detalhe-tag ${simulada ? "simulada" : "real"}`;
        elNumeros.hidden = false;

        const lucro = c.lucro_prejuizo;
        const resultado = `${lucro > 0 ? "+" : ""}${brl(lucro)}`;
        const meta = c.meta_carteira > 0 ? `${Math.round(c.progresso_meta)}% de ${brl0(c.meta_carteira)}` : "Sem meta";

        elNumeros.innerHTML = simulada
            ? numero("Patrimônio da simulação", brl(c.valor)) +
              numero("Saldo para investir", brl(c.saldo_livre_carteira)) +
              numero("Resultado da simulação", `${c.resultado_simulacao > 0 ? "+" : ""}${brl(c.resultado_simulacao)}`, sinal(c.rentabilidade_simulacao), pct(c.rentabilidade_simulacao, 2)) +
              numero("Capital aplicado", brl(c.capital_simulado), "", "saldo inicial + depósitos")
            : numero("Patrimônio", brl(c.valor)) +
              numero("Investido", brl(c.custo)) +
              numero("Resultado em aberto", resultado, sinal(c.rentabilidade_percentual), c.custo > 0 ? pct(c.rentabilidade_percentual, 2) : "") +
              numero("Meta", meta);

        desenharTabela(c);
    }

    function desenharTabela(c) {
        if (!c.ativos.length) {
            elCorpo.innerHTML = c.tipo_carteira === "Simulada"
                ? `<tr><td colspan="7" class="v2-empty carteira-vazia">
                        <strong>Sua simulação tem ${esc(brl(c.saldo_livre_carteira))} para investir.</strong>
                        Escolha um ativo e veja como ele se comporta sem arriscar o seu saldo.
                        <button type="button" class="v2-btn" data-simular>Simular investimento</button>
                   </td></tr>`
                : `<tr><td colspan="7" class="v2-empty carteira-vazia">
                        Esta carteira ainda não tem ativos.
                        <a class="v2-btn" href="aportes.php">Fazer o primeiro aporte</a>
                   </td></tr>`;
            return;
        }

        elCorpo.innerHTML = [...c.ativos]
            .sort((a, b) => b.posicao - a.posicao)
            .map(a => {
                const nome = a.nome_ativo && a.nome_ativo !== a.simbolo_ativo ? a.nome_ativo : "";
                const podeVender = a.categoria_ativo !== "Renda Fixa";
                const origem = a.origem_preco === "estimado" ? "Rendimento estimado"
                    : a.origem_preco === "fechamento" ? "Último fechamento"
                    : a.origem_preco === "custo" ? "Sem cotação: preço médio" : "";

                return `
                    <tr>
                        <td class="v2-wide"><strong>${esc(a.simbolo_ativo)}</strong> <span class="muted">${esc(nome)}</span></td>
                        <td class="num">${esc(fmtQtd.format(a.quantidade_item))}</td>
                        <td class="num">${esc(brl(a.preco_medio_item))}</td>
                        <td class="num"${origem ? ` title="${esc(origem)}"` : ""}>${esc(brl(a.preco_atual))}${origem ? ' <i class="bi bi-info-circle muted" aria-hidden="true"></i>' : ""}</td>
                        <td class="num">${esc(brl(a.posicao))}</td>
                        <td class="num"><span class="v2-delta ${classeDelta(a.rent)}">${esc(a.rent === null ? "—" : pct(a.rent, 2))}</span></td>
                        <td class="num">${podeVender ? `<button type="button" class="carteira-vender" data-vender="${esc(a.simbolo_ativo)}">Vender</button>` : ""}</td>
                    </tr>`;
            }).join("");
    }


    /* =========================
       RENDER GERAL
    ========================= */

    function desenhar(novos) {
        dados = novos;
        resolverAtiva();
        desenharSubtitulo();
        desenharCarteiras();
        desenharPainel();
    }

    async function recarregar() {
        desenhar(await window.V2Dados.refresh());
        window.dispatchEvent(new CustomEvent("accuracy:resumo-atualizado", { detail: dados }));
    }


    /* =========================
       AÇÕES
    ========================= */

    async function criarCarteira() {
        const idsAntes = new Set(dados ? dados.carteiras.map(c => String(c.id_carteira)) : []);
        const criada = await Carteiras.promptNewWallet();

        if (!criada) return;

        try {
            const novos = await window.V2Dados.refresh();
            const nova = novos.carteiras.find(c => !idsAntes.has(String(c.id_carteira)));
            if (nova) definirAtiva(nova.id_carteira);
            desenhar(novos);
            window.V2Toast(nova && nova.tipo_carteira === "Simulada"
                ? "Simulação criada. Agora é só escolher um ativo para investir."
                : "Carteira criada.");
        } catch (erro) {
            window.V2Toast("Carteira criada, mas não foi possível atualizar a tela.");
        }
    }

    async function excluirCarteira() {
        const c = carteiraAtiva();
        if (!c) return;

        const aviso = c.tipo_carteira === "Simulada"
            ? `Excluir a simulação "${c.nome_carteira}"?\n\nAs operações e o saldo fictício dela serão apagados. Seu saldo geral não muda.`
            : `Excluir a carteira "${c.nome_carteira}"?\n\nO histórico de operações dela será apagado. Só é possível excluir uma carteira real depois de vender todos os ativos.`;

        if (!window.confirm(aviso)) return;

        btnExcluir.disabled = true;
        const resultado = await Carteiras.remove(c.id_carteira);
        btnExcluir.disabled = false;

        if (resultado && resultado.error) {
            window.V2Toast(resultado.error);
            return;
        }

        ativaId = null;
        await recarregar();
        window.V2Toast("Carteira excluída.");
    }

    function irParaAportes() {
        const c = carteiraAtiva();
        if (c) definirAtiva(c.id_carteira);
        window.location.href = "aportes.php";
    }


    /* ---------- Janela simples reaproveitada por depósito e venda ---------- */

    function janela({ titulo, subtitulo, conteudo, confirmar, aoConfirmar }) {
        const fundo = document.createElement("div");
        fundo.className = "v2-modal-fundo";
        fundo.innerHTML = `
            <section class="v2-modal" role="dialog" aria-modal="true" aria-labelledby="janelaTitulo">
                <div class="v2-modal-topo">
                    <h2 id="janelaTitulo">${esc(titulo)}</h2>
                    <button type="button" class="v2-modal-fechar" aria-label="Fechar"><i class="bi bi-x-lg"></i></button>
                </div>
                <p class="v2-modal-sub">${esc(subtitulo)}</p>
                <form novalidate>
                    ${conteudo}
                    <p class="v2-modal-erro" role="alert" aria-live="polite"></p>
                    <button class="v2-modal-confirmar" type="submit">${esc(confirmar)}</button>
                </form>
            </section>`;

        document.body.appendChild(fundo);
        const form = fundo.querySelector("form");
        const erro = fundo.querySelector(".v2-modal-erro");
        const botao = fundo.querySelector(".v2-modal-confirmar");
        let enviando = false;

        const fechar = () => { if (!enviando) fundo.remove(); };
        fundo.querySelector(".v2-modal-fechar").addEventListener("click", fechar);
        fundo.addEventListener("click", e => { if (e.target === fundo) fechar(); });
        fundo.addEventListener("keydown", e => { if (e.key === "Escape") fechar(); });

        form.addEventListener("submit", async e => {
            e.preventDefault();
            if (enviando) return;

            enviando = true;
            botao.disabled = true;
            erro.textContent = "";

            try {
                await aoConfirmar(form);
                enviando = false;
                fechar();
            } catch (falha) {
                erro.textContent = falha.message || "Não foi possível concluir.";
                enviando = false;
                botao.disabled = false;
            }
        });

        const primeiro = form.querySelector("input");
        if (primeiro) primeiro.focus();
        return form;
    }

    function lerValor(texto) {
        const limpo = String(texto || "").replace(/\s|R\$/g, "");
        const canonico = limpo.includes(",") ? limpo.replace(/\./g, "").replace(",", ".") : limpo;
        const n = Number(canonico);
        return /^\d+(\.\d{1,2})?$/.test(canonico) && n > 0 ? n : null;
    }

    function depositarNaSimulacao() {
        const c = carteiraAtiva();
        if (!c) return;

        janela({
            titulo: "Depositar na simulação",
            subtitulo: `Adicione dinheiro fictício à carteira "${c.nome_carteira}". O seu saldo geral não muda.`,
            confirmar: "Depositar",
            conteudo: `
                <label for="valorSimulacao">Valor</label>
                <input id="valorSimulacao" type="text" inputmode="decimal" autocomplete="off" placeholder="Ex.: 1.000,00">`,
            aoConfirmar: async form => {
                const valor = lerValor(form.querySelector("input").value);
                if (!valor) throw new Error("Informe um valor maior que zero.");
                await api("/carteiras/depositar-simulacao", { id_carteira: Number(c.id_carteira), valor });
                await recarregar();
                window.V2Toast(`${brl(valor)} adicionados à simulação.`);
            }
        });
    }

    function venderAtivo(simbolo) {
        const c = carteiraAtiva();
        const ativo = c && c.ativos.find(a => a.simbolo_ativo === simbolo);
        if (!ativo) return;

        const preco = ativo.cotacao ?? ativo.preco_atual;
        const maximo = Number(ativo.quantidade_item);

        const form = janela({
            titulo: `Vender ${simbolo}`,
            subtitulo: `${c.nome_carteira} · você tem ${fmtQtd.format(maximo)} unidade(s). Preço atual: ${brl(preco)}.`,
            confirmar: "Confirmar venda",
            conteudo: `
                <label for="quantidadeVenda">Quantidade</label>
                <input id="quantidadeVenda" type="number" inputmode="decimal" min="0" max="${maximo}" step="any" autocomplete="off">
                <div class="v2-modal-sugestoes">
                    <button type="button" data-fracao="0.25">25%</button>
                    <button type="button" data-fracao="0.5">50%</button>
                    <button type="button" data-fracao="1">Tudo</button>
                </div>
                <div class="v2-modal-destaque"><small>Valor estimado da venda</small><strong id="totalVenda">—</strong></div>`,
            aoConfirmar: async formulario => {
                const quantidade = Number(formulario.querySelector("input").value);
                if (!(quantidade > 0) || quantidade > maximo + 1e-8) {
                    throw new Error(`Informe uma quantidade entre 0 e ${fmtQtd.format(maximo)}.`);
                }

                await api("/aportes/registrar-aporte", {
                    ativo_aporte: simbolo,
                    name_ativo: ativo.nome_ativo || simbolo,
                    categoria_ativo: ativo.categoria_ativo,
                    id_carteira: Number(c.id_carteira),
                    tipo_aporte: "Venda",
                    quantidade_aporte: quantidade,
                    valor_aporte: Number((quantidade * preco).toFixed(2)),
                    preco_unitario: preco,
                    recorrencia_aporte: "Único",
                    observacao_aporte: "Venda pela página de carteiras"
                });

                await recarregar();
                window.V2Toast(`Venda de ${fmtQtd.format(quantidade)} ${simbolo} registrada.`);
            }
        });

        const entrada = form.querySelector("input");
        const total = form.querySelector("#totalVenda");
        const atualizarTotal = () => {
            const q = Number(entrada.value);
            total.textContent = q > 0 && q <= maximo + 1e-8 ? brl(q * preco) : "—";
        };

        entrada.addEventListener("input", atualizarTotal);
        form.querySelectorAll("[data-fracao]").forEach(b => b.addEventListener("click", () => {
            const fracao = Number(b.dataset.fracao);
            entrada.value = fracao === 1 ? String(maximo) : String(Math.floor(maximo * fracao * 1e8) / 1e8);
            atualizarTotal();
        }));
    }


    /* =========================
       EVENTOS
    ========================= */

    elCarteiras.addEventListener("click", e => {
        if (e.target.closest("[data-nova]")) {
            criarCarteira();
            return;
        }

        const botao = e.target.closest("[data-id]");
        if (botao && dados) {
            definirAtiva(botao.dataset.id);
            desenharCarteiras();
            desenharPainel();
        }
    });

    elCorpo.addEventListener("click", e => {
        const vender = e.target.closest("[data-vender]");
        if (vender) venderAtivo(vender.dataset.vender);
        if (e.target.closest("[data-simular]")) irParaAportes();
    });

    btnCriar.addEventListener("click", criarCarteira);
    btnExcluir.addEventListener("click", excluirCarteira);
    btnSimular.addEventListener("click", irParaAportes);
    btnDepositar.addEventListener("click", depositarNaSimulacao);
    btnAporte.addEventListener("click", e => { e.preventDefault(); irParaAportes(); });

    window.V2Dados.carregar()
        .then(novos => {
            desenhar(novos);
            if (new URLSearchParams(location.search).get("nova") === "1") criarCarteira();
        })
        .catch(erro => {
            console.error("Erro ao carregar carteiras:", erro);
            elCarteiras.innerHTML = '<button type="button" class="v2-wallet v2-wallet-new" data-nova>+ Nova carteira</button>';
            elSub.textContent = "Não foi possível carregar suas carteiras agora.";
            elCorpo.innerHTML = '<tr><td colspan="7" class="v2-empty">Não foi possível carregar os dados. Tente novamente em instantes.</td></tr>';
        });

})();
