/* =========================================================
   CARTEIRA V2

   Cartões das carteiras (valor, rentabilidade e meta) e a
   tabela de ativos da carteira selecionada.

   Depende de: carteiras.js, resumoCarteiras.js, cotacoes.js
   e shell-v2.js (V2Dados / V2Fmt / V2Toast).
========================================================= */

(function () {

    "use strict";

    const { brl, brl0, pct } = window.V2Fmt;

    const ACTIVE_KEY = "accuracy_carteira_ativa";

    const CORES = ["#4f8cff", "#f59e0b", "#2dd4bf", "#a78bfa", "#f472b6", "#84cc16"];

    const ROTULOS_ESTILO = { "Renda Variavel": "Renda Variável" };

    const $ = id => document.getElementById(id);

    const elCarteiras = $("v2Wallets");
    const elSub = $("v2Sub");
    const elTitulo = $("v2TableTitle");
    const elCorpo = $("v2Body");
    const btnCriar = $("v2CreateBtn");
    const btnExcluir = $("v2DeleteBtn");

    const fmtQtd = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 });

    let dados = null;
    let ativaId = null;
    let termo = "";


    /* =========================
       UTILITÁRIOS
    ========================= */

    function esc(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function norm(texto) {
        return String(texto ?? "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function classeDelta(valor) {

        if (valor === null || valor === undefined || !Number.isFinite(valor)) {
            return "flat";
        }

        if (valor > 0.0499) {
            return "up";
        }

        return valor < -0.0499 ? "down" : "flat";
    }

    function carteiraAtiva() {
        return dados
            ? dados.carteiras.find(c => String(c.id_carteira) === String(ativaId)) || null
            : null;
    }

    function ordenadas(lista) {
        return [...lista].sort((a, b) => Number(a.id_carteira) - Number(b.id_carteira));
    }

    function resolverAtiva() {

        const lista = dados.carteiras;

        const existe = id => id != null && lista.some(c => String(c.id_carteira) === String(id));

        if (existe(ativaId)) {
            return;
        }

        const salva = localStorage.getItem(ACTIVE_KEY);

        ativaId = existe(salva)
            ? String(salva)
            : (lista[0] ? String(lista[0].id_carteira) : null);
    }

    function definirAtiva(id) {

        ativaId = String(id);

        try {
            localStorage.setItem(ACTIVE_KEY, ativaId);
        } catch { /* sem storage: só não lembra */ }
    }


    /* =========================
       CARTÕES DAS CARTEIRAS
    ========================= */

    function cartao(c, i) {

        const cor = CORES[i % CORES.length];
        const meta = Number(c.meta_carteira) || 0;
        const progresso = meta > 0 ? Math.min(100, (c.valor / meta) * 100) : 0;

        const cls = classeDelta(c.rent);
        const seta = cls === "up" ? "▲" : (cls === "down" ? "▼" : "");

        let delta;

        if (!c.ativos.length) {
            delta = "Sem ativos";
        } else if (c.rent === null) {
            delta = "Sem cotações";
        } else {
            delta = pct(c.rent);
        }

        const metaTxt = meta > 0
            ? `Meta ${brl0(meta)} · ${Math.round(progresso)}%`
            : "Sem meta definida";

        const selecionada = String(c.id_carteira) === String(ativaId);

        const estilo = ROTULOS_ESTILO[c.estilo_carteira] || c.estilo_carteira || "";
        const etiqueta = [c.tipo_carteira, estilo].filter(Boolean).join(" · ");

        return `
            <button type="button"
                    class="v2-wallet${selecionada ? " selected" : ""}"
                    style="--c:${cor}"
                    data-id="${esc(c.id_carteira)}">
                <span class="v2-wallet-name">${esc(c.nome_carteira)}</span>
                ${etiqueta ? `<span class="v2-wallet-tag">${esc(etiqueta)}</span>` : ""}
                <span class="v2-wallet-value">${esc(brl0(c.valor))}</span>
                <span class="v2-wallet-delta ${cls}">${seta && c.rent !== null && c.ativos.length ? `<span class="arr">${seta}</span> ` : ""}${esc(delta)}</span>
                <span class="v2-track"><i style="width:${progresso}%"></i></span>
                <span class="v2-wallet-goal">${esc(metaTxt)}</span>
            </button>
        `;
    }

    function desenharCarteiras() {

        const lista = ordenadas(dados.carteiras);

        elCarteiras.innerHTML = lista.map(cartao).join("") + `
            <button type="button" class="v2-wallet v2-wallet-new" data-nova>
                + Nova carteira
            </button>
        `;
    }

    function desenharSubtitulo() {

        if (!dados.carteiras.length) {
            elSub.textContent = "Você ainda não tem carteiras";
            return;
        }

        const total = brl0(dados.total);

        elSub.textContent = dados.rent === null
            ? `${total} no total`
            : `${total} no total · ${pct(dados.rent)} desde o início`;
    }


    /* =========================
       TABELA DE ATIVOS
    ========================= */

    function desenharTabela() {

        const c = carteiraAtiva();

        btnExcluir.hidden = !c;

        if (!c) {
            elTitulo.textContent = "Aportes na carteira";
            elCorpo.innerHTML = `
                <tr><td colspan="5" class="v2-empty">
                    Crie uma carteira para começar a acompanhar seus aportes.
                </td></tr>`;
            return;
        }

        elTitulo.textContent = `Aportes na carteira ${c.nome_carteira}`;

        const t = norm(termo.trim());

        const linhas = [...c.ativos]
            .sort((a, b) => b.posicao - a.posicao)
            .filter(a => !t || norm(a.simbolo_ativo).includes(t) || norm(a.nome_ativo).includes(t));

        if (!linhas.length) {

            elCorpo.innerHTML = t
                ? `<tr><td colspan="5" class="v2-empty">Nenhum ativo encontrado para “${esc(termo.trim())}”.</td></tr>`
                : `<tr><td colspan="5" class="v2-empty">Esta carteira ainda não tem ativos. <a href="aportes.php">Fazer um aporte</a></td></tr>`;

            return;
        }

        elCorpo.innerHTML = linhas.map(a => {

            const cls = classeDelta(a.rent);
            const nome = a.nome_ativo && a.nome_ativo !== a.simbolo_ativo ? a.nome_ativo : "";

            return `
                <tr>
                    <td><strong>${esc(a.simbolo_ativo)}</strong> <span class="muted">${esc(nome)}</span></td>
                    <td class="num">${esc(fmtQtd.format(a.quantidade_item))}</td>
                    <td class="num">${esc(brl(a.preco_medio_item))}</td>
                    <td class="num">${esc(brl(a.posicao))}</td>
                    <td class="num"><span class="v2-delta ${cls}">${esc(a.rent === null ? "—" : pct(a.rent, 2))}</span></td>
                </tr>
            `;
        }).join("");
    }


    /* =========================
       RENDER GERAL
    ========================= */

    function desenhar(novosDados) {

        dados = novosDados;
        resolverAtiva();

        desenharSubtitulo();
        desenharCarteiras();
        desenharTabela();
    }

    function mostrarErro() {
        elCarteiras.innerHTML = `
            <button type="button" class="v2-wallet v2-wallet-new" data-nova>+ Nova carteira</button>`;
        elSub.textContent = "Não foi possível carregar suas carteiras agora";
        elCorpo.innerHTML = `<tr><td colspan="5" class="v2-empty">Não foi possível carregar os dados. Tente novamente em instantes.</td></tr>`;
    }


    /* =========================
       AÇÕES
    ========================= */

    async function criarCarteira() {

        const antes = dados ? dados.carteiras.length : 0;
        const idsAntes = new Set(dados ? dados.carteiras.map(c => String(c.id_carteira)) : []);

        await Carteiras.promptNewWallet();
        await Carteiras.load();

        if (Carteiras.list().length === antes) {
            return;
        }

        try {

            const novos = await V2Dados.refresh();
            const nova = novos.carteiras.find(c => !idsAntes.has(String(c.id_carteira)));

            if (nova) {
                definirAtiva(nova.id_carteira);
            }

            desenhar(novos);

        } catch (erro) {
            console.error(erro);
            V2Toast("Carteira criada, mas não foi possível atualizar a tela.");
        }
    }

    async function excluirCarteira() {

        const c = carteiraAtiva();

        if (!c) {
            return;
        }

        const confirmou = window.confirm(
            `Excluir a carteira "${c.nome_carteira}"? ` +
            "Todos os aportes e posições dela serão apagados. " +
            "Essa ação não pode ser desfeita."
        );

        if (!confirmou) {
            return;
        }

        btnExcluir.disabled = true;

        const resultado = await Carteiras.remove(c.id_carteira);

        btnExcluir.disabled = false;

        if (resultado && resultado.error) {
            V2Toast(resultado.error);
            return;
        }

        ativaId = null;

        try {
            await Carteiras.load();
            desenhar(await V2Dados.refresh());
            V2Toast("Carteira excluída.");
        } catch (erro) {
            console.error(erro);
        }
    }

    elCarteiras.addEventListener("click", e => {

        if (e.target.closest("[data-nova]")) {
            criarCarteira();
            return;
        }

        const botao = e.target.closest("[data-id]");

        if (botao && dados) {
            definirAtiva(botao.dataset.id);
            desenharCarteiras();
            desenharTabela();
        }
    });

    btnCriar.addEventListener("click", criarCarteira);
    btnExcluir.addEventListener("click", excluirCarteira);

    /* busca do topo filtra os ativos da carteira aberta */
    window.addEventListener("v2:busca", e => {
        termo = String(e.detail || "");

        if (dados) {
            desenharTabela();
        }
    });


    /* =========================
       INÍCIO
    ========================= */

        // ACC_PERF_CARTEIRAS_V1 - carregamento progressivo sem mostrar valores ficticios.
    window.addEventListener("accuracy:carteiras-basicas", evento => {
        if (dados) return;
        const lista = Array.isArray(evento.detail) ? evento.detail : [];
        if (!lista.length) return;
        elCarteiras.innerHTML = lista.map((c, i) => `
            <div class="v2-wallet" style="--c:${CORES[i % CORES.length]}">
                <span class="v2-wallet-name">${esc(c.nome_carteira || "Carteira")}</span>
                <span class="v2-wallet-tag">${esc(c.tipo_carteira || "")}</span>
                <span class="v2-wallet-delta">Carregando investimentos...</span>
            </div>
        `).join("") + `<button type="button" class="v2-wallet v2-wallet-new" data-nova>+ Nova carteira</button>`;
        elSub.textContent = "Carteiras encontradas. Carregando posicoes...";
    });

    // O shell ja atualiza o resumo; reaproveitar o resultado na tela sem novo fetch.
    window.addEventListener("accuracy:resumo-atualizado", evento => {
        const resultado = evento.detail;
        if (resultado && Array.isArray(resultado.carteiras)) desenhar(resultado);
    });
V2Dados.carregar({ onParcial: desenhar })
        .then(desenhar)
        .catch(erro => {
            console.error("Erro ao carregar carteiras:", erro);

            if (!dados) {
                mostrarErro();
            }
        });

})();
