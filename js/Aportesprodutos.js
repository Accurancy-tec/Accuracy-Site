/* =========================================================
   APORTES - SELETOR DE PRODUTOS (carregar DEPOIS do Aportes.js)

   Fluxo:
     Produtos  ->  Renda variável  ->  lista de ativos  ->  formulário
     Produtos  ->  Renda fixa / Tesouro / Cripto ...    ->  formulário

   Não altera o Aportes.js. O <select id="asset"> continua sendo
   a fonte do ativo escolhido: ao selecionar um produto aqui, a
   opção é criada no select, o valor é definido e o evento
   "change" é disparado (cotação, nome e categoria seguem iguais).
========================================================= */

(function () {

    "use strict";

    const root = document.getElementById("ppRoot");
    const formStep = document.getElementById("formStep");
    const selectedBox = document.getElementById("ppSelected");

    if (!root || !formStep || typeof asset === "undefined") {
        return;
    }

    const FAV_KEY = "accuracy_favoritos_ativos";


    /* =========================
       CATÁLOGO
       cls = categoria enviada à API (mesmas usadas no dashboard)
    ========================= */

    const PRODUTOS = [
        { id: "fixa", sigla: "CDB", cor: "cyan", titulo: "Renda fixa", desc: "CDB, LCI e LCA" },
        { id: "tesouro", sigla: "TD", cor: "blue", titulo: "Tesouro Direto", desc: "Títulos públicos" },
        { id: "fiis", sigla: "FII", cor: "yellow", titulo: "Fundos imobiliários", desc: "FIIs listados na BRAPI" },
        { id: "moedas", sigla: "USD", cor: "purple", titulo: "Moedas", desc: "Câmbio e moedas internacionais" },
        { id: "bolsa", sigla: "B3", cor: "green", titulo: "Bolsa", desc: "Ações, FIIs e BDRs" },
        { id: "cripto", sigla: "BTC", cor: "orange", titulo: "Cripto", desc: "Bitcoin e mais" },
    ];

    const CATEGORIAS_VARIAVEL = [
        { id: "acoes", sigla: "AÇ", cor: "green", titulo: "Ações Nacionais", desc: "Empresas listadas na B3", cls: "Ações" },
        { id: "futuros", sigla: "FUT", cor: "orange", titulo: "Contratos Futuros", desc: "Índice, dólar e criptos", cls: "Futuros" },
        { id: "bdr", sigla: "BDR", cor: "purple", titulo: "Ações e ETFs Internacionais", desc: "BDRs", cls: "Ações" },
        { id: "etf", sigla: "ETF", cor: "blue", titulo: "ETFs", desc: "Fundos de índices de ações e outros", cls: "Ações" }
    ];

    /* Listas fixas (as ações nacionais vêm da API) */
    const LISTAS = {
        fiis: ["XPML11", "HGLG11", "MXRF11", "KNRI11", "VISC11", "XPLG11", "BTLG11", "HGRU11"],
        etf: ["BOVA11", "IVVB11", "SMAL11", "HASH11", "GOLD11", "DIVO11"],
        bdr: ["AAPL34", "MSFT34", "AMZO34", "GOGL34", "NVDC34", "TSLA34", "MELI34"],
        cripto: [
            ["Bitcoin", "BTC"],
            ["Ethereum", "ETH"],
            ["Solana", "SOL"],
            ["XRP", "XRP"]
        ]
    };

    /* Títulos de renda fixa e Tesouro: vêm do cadastro da API (listar-titulosRF) */
    const RENDA_FIXA = [];
    const TESOURO = [];


    /* Renda fixa e Tesouro: carrega os títulos cadastrados na API */
    async function carregarTitulosRF() {
        try {
            const resp = await fetch(`${API_BASE_URL}/aportes/listar-titulosRF`);

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const dados = await resp.json();

            if (!dados.success || !Array.isArray(dados.titulos) || !dados.titulos.length) {
                return;
            }

            const rf = [];
            const td = [];

            dados.titulos.forEach(t => {
                const nome = String(t.nome_titulo || "").trim();

                if (!nome) {
                    return;
                }

                const tipo = String(t.tipo_titulo || "").trim();
                const ehTesouro = /tesouro/i.test(nome) || /tesouro/i.test(tipo);
                const temFgc = [true, "t", "true", "1", 1].includes(t.possui_garantia_fgc);

                const tags = [];

                if (temFgc) {
                    tags.push("Garantia FGC");
                }

                if (ehTesouro) {
                    tags.push("Título público");
                }

                const r = t.rentabilidade;
                const idx = t.indexador;

                const rent = (r !== null && r !== undefined && r !== "" && isFinite(Number(r)))
                    ? `${String(Number(r)).replace(".", ",")}%${idx ? " " + idx : ""}`
                    : [r, idx].filter(Boolean).join(" ");

                const item = {
                    idTitulo: t.id_titulo,
                    value: nome,
                    tipo: tipo || (ehTesouro ? "Tesouro" : "Renda fixa"),
                    tags,
                    rent: rent || "—",
                    resgate: t.liquidez || t.vencimento || "—"
                };

                const minimo = Number(t.aplicacao_minima);

                if (minimo > 0) {
                    item.minimo = minimo;
                }

                (ehTesouro ? td : rf).push(item);
            });

            if (rf.length) {
                RENDA_FIXA.splice(0, RENDA_FIXA.length, ...rf);
            }

            if (td.length) {
                TESOURO.splice(0, TESOURO.length, ...td);
            }

            window.dispatchEvent(new Event("accuracy:rf-carregada"));

            /* a home mostra os cartões de renda fixa: atualiza se estiver aberta */
            if (typeof pilha !== "undefined" && pilha.length && pilha[pilha.length - 1].tela === "produtos") {
                desenharFixasHome();
            }

        } catch (erro) {
            console.error("Erro ao listar títulos de renda fixa:", erro);
        }
    }

    carregarTitulosRF();


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
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase();
    }

    /* Logo fornecida pela API da Accuracy/BRAPI; ticker se não existir. */
    function logoAtivo(item, classe = "ac-asset-symbol") {
        const sigla = esc(String(item.value || item.sigla || "AT").slice(0, 3));
        let url = "";
        try {
            const candidata = new URL(String(item.logo || ""));
            if (candidata.protocol === "https:") url = candidata.href;
        } catch (_) { /* Sem logo válida: mostra a sigla. */ }

        return `<span class="${classe} ac-logo-wrap">
            <span class="ac-logo-fallback">${sigla}</span>
            ${url ? `<img class="ac-logo-img" src="${esc(url)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : ""}
        </span>`;
    }

    // Quando uma logo não carrega, mostra o ticker sem imagem quebrada.
    document.addEventListener("error", e => {
        if (e.target instanceof HTMLImageElement && e.target.classList.contains("ac-logo-img")) {
            e.target.remove();
        }
    }, true);

    function brl(valor) {
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
    }

    function lerFavoritos() {
        try {
            return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
        } catch {
            return [];
        }
    }

    function gravarFavoritos(lista) {
        try {
            localStorage.setItem(FAV_KEY, JSON.stringify(lista));
        } catch { /* sem storage: apenas não persiste */ }
    }

    function ehFavorito(value) {
        return lerFavoritos().some(f => f.value === value);
    }

    function alternarFavorito(item) {
        const lista = lerFavoritos();
        const i = lista.findIndex(f => f.value === item.value);

        if (i >= 0) {
            lista.splice(i, 1);
        } else {
            lista.push({ value: item.value, name: item.name, sub: item.sub, cls: item.cls, sigla: item.sigla, cor: item.cor, logo: item.logo || null });
        }

        gravarFavoritos(lista);
    }


    /* =========================
       ESCOLHER O ATIVO
    ========================= */

    function escolher(item) {

        /* categoria usada por classOf() ao registrar o aporte */
        ASSET_CLASS[item.value] = item.cls;
        // ACCURACY_PRODUTO_CATEGORIA_V1: category for wallet filtering only.
        window.AccuracyCategoriaProduto = { value: String(item.value), cls: item.cls, sigla: item.sigla, rota: item.rota, sub: item.sub };

        /* renda fixa / Tesouro: guarda o id_titulo que a API exige ao registrar */
        window.ASSET_TITULO = window.ASSET_TITULO || {};

        if (item.idTitulo) {
            window.ASSET_TITULO[item.value] = item.idTitulo;
        } else {
            delete window.ASSET_TITULO[item.value];
        }

        /* rota de cotação: "cripto", "futuros" ou nenhuma (ações, FIIs...) */
        if (item.rota) {
            window.ASSET_ROTA[item.value] = item.rota;
        } else {
            delete window.ASSET_ROTA[item.value];
        }

        let option = Array.from(asset.options).find(o => o.value === item.value);

        if (!option) {
            option = document.createElement("option");
            option.value = item.value;
            asset.appendChild(option);
        }

        /* o Aportes.js usa o texto antes do "—" como nome do ativo */
        option.textContent = item.sub ? `${item.name} — ${item.sub}` : item.name;

        asset.value = item.value;
        asset.dispatchEvent(new Event("change"));

        /* Detalhes do ativo (js/aportesDetalhe.js) -> formulário.
           Sem o módulo carregado, vai direto para o formulário. */
        if (typeof AtivoDetalhe !== "undefined") {
            irPara("detalhe", { item });
        } else {
            mostrarFormulario(item);
        }
    }

    function mostrarFormulario(item) {
        root.classList.add("hidden");
        formStep.classList.remove("hidden");

        selectedBox.innerHTML = `
            ${logoAtivo(item, "pp-badge ac-logo-small")}
            <div class="pp-row-info">
                <strong>${esc(item.name)}</strong>
                <small>${esc(item.sub || item.cls)}</small>
            </div>
            <button type="button" class="pp-change" id="ppChange">Trocar</button>
        `;

        document.getElementById("ppChange").addEventListener("click", () => {
            formStep.classList.add("hidden");
            root.classList.remove("hidden");
            irPara("produtos");
        });
    }


    /* =========================
       NAVEGAÇÃO ENTRE TELAS
    ========================= */

    const pilha = [];
    let busca = "";

    function irPara(tela, params = {}) {
        if (tela === "produtos") {
            pilha.length = 0;
            window.dispatchEvent(new Event("v2:busca-limpar"));
        }

        pilha.push({ tela, params });
        busca = "";
        desenhar();
    }

    function voltar() {
        pilha.pop();

        if (!pilha.length) {
            pilha.push({ tela: "produtos", params: {} });
        }

        busca = "";
        desenhar();
    }

    function cabecalho(titulo, comVoltar) {
        return `
            <div class="pp-head">
                ${comVoltar ? '<button type="button" class="pp-back" data-voltar aria-label="Voltar"><i class="bi bi-chevron-left"></i></button>' : ""}
                <h3>${esc(titulo)}</h3>
            </div>
        `;
    }

    let tamanhoAnterior = 0;
    let temporizador = null;

    /* Dispara a animação de troca de tela (entra da direita ao avançar,
       da esquerda ao voltar). A classe sai logo depois, para as
       atualizações dentro da mesma tela não repetirem o efeito. */
    function animarTroca() {
        root.dataset.dir = pilha.length >= tamanhoAnterior ? "fwd" : "back";
        tamanhoAnterior = pilha.length;

        root.classList.remove("pp-anim");
        void root.offsetWidth;
        root.classList.add("pp-anim");

        clearTimeout(temporizador);
        temporizador = setTimeout(() => root.classList.remove("pp-anim"), 1800);
    }

    function desenhar() {
        const atual = pilha[pilha.length - 1];

        animarTroca();

        switch (atual.tela) {
            case "produtos": return telaProdutos();
            case "variavel": return telaVariavel(atual.params);
            case "lista": return telaLista(atual.params);
            case "cards": return telaCards(atual.params);
            case "detalhe": return telaDetalhe(atual.params);
            case "busca": return telaBusca();
        }
    }

    root.addEventListener("click", e => {
        if (e.target.closest("[data-voltar]")) {

            /* saindo da busca do topo: limpa o campo */
            if (pilha[pilha.length - 1].tela === "busca") {
                window.dispatchEvent(new Event("v2:busca-limpar"));
            }

            voltar();
        }
    });


    /* =========================
       DETALHES DO ATIVO
       (a tela em si está em js/aportesDetalhe.js)
       Vender / Comprar abrem o formulário já com o tipo escolhido.
    ========================= */

    function telaDetalhe(params) {

        const item = params.item;

        AtivoDetalhe.desenhar(root, item, {

            ehFavorito: () => ehFavorito(item.value),

            alternarFavorito: () => alternarFavorito(item),

            aoAcao: tipo => {
                const campoTipo = document.getElementById("type");

                if (campoTipo) {
                    campoTipo.value = tipo;
                    campoTipo.dispatchEvent(new Event("change"));
                }

                mostrarFormulario(item);
            }
        });
    }


    /* =========================
       TELA 1 - PRODUTOS
    ========================= */

    /* abas da tabela de renda variável (home) */
    const ABAS_RV = [
        ["todas", "Todas"],
        ["acoes", "Ações"],
        ["fiis", "FIIs"],
        ["bdr", "BDRs"],
        ["etf", "ETFs"]
    ];

    let rvAba = "todas";
    let rvPromessa = null;
    let rvLista = [];

    const sufixoBdrEtf = /\s*\((BDR|ETF)\)\s*$/i;

    function nomeLimpo(texto) {
        return String(texto ?? "").replace(sufixoBdrEtf, "");
    }

    function formatarVariacao(v) {
        const n = Number(v);

        if (!Number.isFinite(n)) {
            return { cls: "flat", texto: "—" };
        }

        const texto = Math.abs(n).toFixed(2).replace(".", ",");

        if (n > 0) {
            return { cls: "up", texto: `+${texto}%` };
        }

        return n < 0 ? { cls: "down", texto: `-${texto}%` } : { cls: "flat", texto: `${texto}%` };
    }

    /* carrega o que a home e a busca precisam (ações, FIIs, BDRs e ETFs) */
    async function carregarIntlHome() {
        const f = FONTES_API.intl;
        const tem = suf => f.itens.some(x => String(x.name).endsWith(suf));

        for (let i = 0; i < 4 && !(tem("(BDR)") && tem("(ETF)")) && f.temMais; i++) {
            await carregarFonte("intl");

            if (f.erro) {
                break;
            }
        }
    }

    function garantirRV() {
        if (rvPromessa) {
            return rvPromessa;
        }

        const tarefas = [];

        if (!acoes.length && temMais) {
            tarefas.push(carregarAcoes());
        }

        if (!FONTES_API.fiis.itens.length && FONTES_API.fiis.temMais) {
            tarefas.push(carregarFonte("fiis"));
        }

        if (!FONTES_API.intl.itens.length && FONTES_API.intl.temMais) {
            tarefas.push(carregarIntlHome());
        }

        rvPromessa = Promise.all(tarefas).finally(() => { rvPromessa = null; });

        return rvPromessa;
    }

    function itensRV() {
        const ac = acoes.map(a => ({ ...itemDeAcao(a), categoria: "Ações" }));

        const fi = FONTES_API.fiis.itens
            .map(x => ({ ...itemDeFonte(x, { cls: "FIIs", sigla: "FII", cor: "yellow" }), categoria: "FIIs" }));

        const bd = FONTES_API.intl.itens
            .filter(x => String(x.name).endsWith("(BDR)"))
            .map(x => ({ ...itemDeFonte(x, { cls: "Ações", sigla: "BDR", cor: "purple" }), categoria: "BDRs" }));

        const et = FONTES_API.intl.itens
            .filter(x => String(x.name).endsWith("(ETF)"))
            .map(x => ({ ...itemDeFonte(x, { cls: "Ações", sigla: "ETF", cor: "blue" }), categoria: "ETFs" }));

        switch (rvAba) {
            case "acoes": return ac.slice(0, 5);
            case "fiis": return fi.slice(0, 5);
            case "bdr": return bd.slice(0, 5);
            case "etf": return et.slice(0, 5);
        }

        /* "Todas": um pouco de cada categoria, completando até 5 linhas */
        const base = [ac[0], ac[1], fi[0], bd[0], et[0]].filter(Boolean);
        const usados = new Set(base.map(i => i.value));
        const resto = [...ac.slice(2), ...fi.slice(1), ...bd.slice(1), ...et.slice(1)]
            .filter(i => !usados.has(i.value));

        return [...base, ...resto].slice(0, 5);
    }

    function desenharCorpoRV(carregandoAinda) {
        const corpo = document.getElementById("v2RvBody");

        if (!corpo) {
            return;
        }

        rvLista = itensRV();

        if (!rvLista.length) {
            const msg = carregandoAinda
                ? "Carregando..."
                : (erroAcoes || FONTES_API.fiis.erro || FONTES_API.intl.erro || "Nenhum ativo disponível agora.");

            corpo.innerHTML = `<tr><td colspan="6" class="v2-empty">${esc(msg)}</td></tr>`;
            return;
        }

        corpo.innerHTML = rvLista.map((i, n) => {
            const v = formatarVariacao(i.variacao);

            return `
                <tr data-n="${n}">
                    <td class="v2-celula-larga"><span class="ac-table-ticker">${logoAtivo(i, "ac-asset-symbol ac-logo-small")}<strong>${esc(i.value)}</strong></span></td>
                    <td class="v2-celula-larga" data-rotulo="Empresa">${esc(nomeLimpo(i.sub))}</td>
                    <td class="muted v2-celula-larga" data-rotulo="Categoria">${esc(i.categoria)}</td>
                    <td class="num" data-rotulo="Preço">${i.preco != null ? esc(brl(i.preco)) : "—"}</td>
                    <td class="center" data-rotulo="Variação"><span class="v2-delta ${v.cls}">${esc(v.texto)}</span></td>
                    <td class="num v2-celula-acao"><button type="button" class="v2-see" data-ver="${n}">Ver</button></td>
                </tr>
            `;
        }).join("");
    }

    function desenharFixasHome() {
        const alvo = document.getElementById("v2Fixas");

        if (!alvo) {
            return;
        }

        const minusculo = t => {
            const x = String(t ?? "—");
            return /^[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-záéíóúâêôãõç]/.test(x) ? x.charAt(0).toLowerCase() + x.slice(1) : x;
        };

        alvo.innerHTML = RENDA_FIXA.filter(i => i.idTitulo != null).slice(0, 3).map((i, n) => `
            <button type="button" class="v2-fixa" data-fixa="${n}">
                <div class="v2-fixa-tags">
                    <span class="v2-tag">${esc(i.tipo)}</span>
                    ${(i.tags || []).slice(0, 2).map(t => `<span class="v2-tag">${esc(t)}</span>`).join("")}
                </div>
                <h3>${esc(i.value)}</h3>
                <div class="v2-rate">${esc(i.rent)}</div>
                <p>Resgate ${esc(minusculo(i.resgate))}${i.minimo != null ? ` · mínimo ${esc(brl(i.minimo))}` : ""}</p>
            </button>
        `).join("");

        alvo.querySelectorAll("[data-fixa]").forEach(card => card.addEventListener("click", () => {
            escolherFixa(RENDA_FIXA[Number(card.dataset.fixa)], { cls: "Renda Fixa", sigla: "CDB", cor: "cyan" });
        }));
    }

    function telaProdutos() {

        root.innerHTML = `
            <div class="v2-tiles">
                ${PRODUTOS.map(p => `
                    <button type="button" class="v2-tile" data-produto="${p.id}">
                        <span class="v2-tag">${esc(p.sigla)}</span>
                        <strong>${esc(p.titulo)}</strong>
                        <small>${esc(p.desc)}</small>
                    </button>
                `).join("")}
            </div>

            <section class="v2-panel">
                <div class="v2-panel-head">
                    <h2>Renda variável</h2>
                    <button type="button" class="v2-link-btn" data-produto="variavel">Ver todos</button>
                </div>

                <div class="v2-pills" id="v2RvAbas">
                    ${ABAS_RV.map(([id, nome]) => `
                        <button type="button" data-aba="${id}" class="${id === rvAba ? "active" : ""}">${nome}</button>
                    `).join("")}
                </div>

                <div class="v2-table-wrap">
                    <table class="v2-table v2-tabela-cartoes">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Empresa</th>
                                <th>Categoria</th>
                                <th class="num">Preço</th>
                                <th class="center">Variação</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id="v2RvBody">
                            <tr><td colspan="6" class="v2-empty">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <h2 class="v2-section-title">Renda fixa</h2>
            <div class="v2-fixas" id="v2Fixas"></div>
        `;

        root.querySelectorAll("[data-produto]").forEach(btn => {
            btn.addEventListener("click", () => abrirProduto(btn.dataset.produto));
        });

        root.querySelectorAll("#v2RvAbas [data-aba]").forEach(btn => btn.addEventListener("click", () => {
            rvAba = btn.dataset.aba;

            root.querySelectorAll("#v2RvAbas [data-aba]").forEach(b => b.classList.toggle("active", b === btn));

            desenharCorpoRV(Boolean(rvPromessa));
        }));

        document.getElementById("v2RvBody").addEventListener("click", e => {
            const linha = e.target.closest("tr[data-n]");

            if (linha && rvLista[Number(linha.dataset.n)]) {
                escolher(rvLista[Number(linha.dataset.n)]);
            }
        });

        desenharFixasHome();

        /* mostra o que já está em memória e completa quando a API responder */
        desenharCorpoRV(true);

        garantirRV().then(() => {
            if (document.getElementById("v2RvBody")) {
                desenharCorpoRV(false);
            }
        });
    }


    /* =========================
       BUSCA DO TOPO
       (campo "Buscar empresa ou código do ativo")
    ========================= */

    function telaBusca() {

        const campo = document.getElementById("pesquisaAtivosAportes");

        busca = campo ? campo.value : busca;

        root.innerHTML = `
            ${cabecalho("Resultados da busca", true)}
            <div id="ppCorpo"></div>
        `;

        corpoBusca();

        garantirRV().then(() => {
            const atual = pilha[pilha.length - 1];

            if (atual && atual.tela === "busca") {
                corpoBusca();
            }
        });
    }

    function corpoBusca() {
        const alvo = document.getElementById("ppCorpo");

        if (!alvo) {
            return;
        }

        if (!busca.trim()) {
            alvo.innerHTML = "";
            return;
        }

        listarBusca(alvo);
    }

    function buscarTopo(texto) {

        const atual = pilha[pilha.length - 1];

        busca = String(texto || "");

        if (!busca.trim()) {

            if (atual && atual.tela === "busca") {
                voltar();
            }

            return;
        }

        /* estava no formulário: volta para o seletor para mostrar os resultados */
        if (!formStep.classList.contains("hidden")) {
            formStep.classList.add("hidden");
            root.classList.remove("hidden");
        }

        if (!atual || atual.tela !== "busca") {
            pilha.push({ tela: "busca", params: {} });
            desenhar();
            return;
        }

        corpoBusca();
    }

    window.addEventListener("v2:busca", e => buscarTopo(e.detail));

    // Barra única: permanece fora do ppRoot e funciona em qualquer categoria.
    const pesquisaAtivosAportes = document.getElementById("pesquisaAtivosAportes");
    if (pesquisaAtivosAportes) {
        pesquisaAtivosAportes.addEventListener("input", () => {
            buscarTopo(pesquisaAtivosAportes.value);
        });
        pesquisaAtivosAportes.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                pesquisaAtivosAportes.value = "";
                buscarTopo("");
            }
        });
        window.addEventListener("v2:busca-limpar", () => {
            pesquisaAtivosAportes.value = "";
        });
    }

    /* busca vinda de outra página: aportes.php?q=PETR */
    (function buscaInicial() {
        const q = new URLSearchParams(window.location.search).get("q");
        const campo = document.getElementById("pesquisaAtivosAportes");

        if (q && campo) {
            campo.value = q;
            setTimeout(() => buscarTopo(q), 0);
        }
    })();


    function abrirProduto(id) {
        switch (id) {
            case "fixa":
                return irPara("cards", { titulo: "Renda fixa", itens: RENDA_FIXA, cls: "Renda Fixa", sigla: "CDB", cor: "cyan" });
            case "tesouro":
                return irPara("cards", { titulo: "Tesouro Direto", itens: TESOURO, cls: "Renda Fixa", sigla: "TD", cor: "blue" });
            case "fiis":
                return irPara("lista", { titulo: "Fundos imobiliários", fonte: "fiis", cls: "FIIs", sigla: "FII", cor: "yellow" });
            case "moedas":
                return irPara("lista", { titulo: "Moedas", fonte: "moedas", cls: "Internacional", sigla: "FX", cor: "purple" });
            case "bolsa":
            case "variavel":
                return irPara("variavel");
            case "cripto":
                return irPara("lista", { titulo: "Cripto", fonte: "cripto", cls: "Cripto", sigla: "₿", cor: "orange" });
        }
    }


    /* =========================
       TELA 2 - RENDA VARIÁVEL
    ========================= */

    function telaVariavel(params) {

        const aba = params.aba || "geral";
        const filtro = params.filtro || "categoria";

        root.innerHTML = `
            ${cabecalho("Renda variável", true)}

            <div class="pp-tabs">
                <button type="button" data-aba="geral" class="${aba === "geral" ? "active" : ""}">Listagem geral</button>
                <button type="button" data-aba="favoritos" class="${aba === "favoritos" ? "active" : ""}">Favoritos</button>
            </div>

            ${aba === "geral" ? `
                <div class="pp-chips">
                    <button type="button" data-filtro="categoria" class="${filtro === "categoria" ? "active" : ""}">Categoria</button>
                    <button type="button" data-filtro="negociadas" class="${filtro === "negociadas" ? "active" : ""}">Mais negociadas</button>
                    <button type="button" data-filtro="baixas" class="${filtro === "baixas" ? "active" : ""}">Maiores baixas</button>
                </div>
            ` : ""}

            <div id="ppCorpo"></div>
        `;

        const atual = pilha[pilha.length - 1];

        root.querySelectorAll("[data-aba]").forEach(b => b.addEventListener("click", () => {
            atual.params = { ...params, aba: b.dataset.aba };
            desenhar();
        }));

        root.querySelectorAll("[data-filtro]").forEach(b => b.addEventListener("click", () => {
            atual.params = { ...params, filtro: b.dataset.filtro };
            desenhar();
        }));

        function corpo() {
            const alvo = document.getElementById("ppCorpo");

            /* Digitou algo: busca em tudo, qualquer aba/filtro */
            if (busca.trim()) {
                return listarBusca(alvo);
            }

            if (aba === "favoritos") {
                return listarFavoritos(alvo);
            }

            if (filtro === "categoria") {
                alvo.innerHTML = `
                    <div class="pp-grid">
                        ${CATEGORIAS_VARIAVEL.map(c => `
                            <button type="button" class="pp-tile" data-cat="${c.id}">
                                <span class="pp-badge ${c.cor}">${esc(c.sigla)}</span>
                                <strong>${esc(c.titulo)}</strong>
                                <small>${esc(c.desc)}</small>
                            </button>
                        `).join("")}
                    </div>
                `;

                alvo.querySelectorAll("[data-cat]").forEach(btn => btn.addEventListener("click", () => {
                    const c = CATEGORIAS_VARIAVEL.find(x => x.id === btn.dataset.cat);
                    irPara("lista", { titulo: c.titulo, fonte: c.id, cls: c.cls, sigla: c.sigla, cor: c.cor });
                }));

                return;
            }

            /* mais negociadas / maiores baixas: usa as ações carregadas da API */
            irRanking(alvo, filtro);
        }

        corpo();
    }

    function listarFavoritos(alvo) {
        const favs = lerFavoritos();

        if (!favs.length) {
            alvo.innerHTML = `<div class="pp-empty">Nenhum favorito ainda.<br>Toque na estrela de um ativo para salvá-lo.</div>`;
            return;
        }

        desenharLinhas(alvo, favs);
    }

    /* Busca direto na Brapi (via API) pelo texto digitado, em vez de
   só filtrar o que já foi carregado nas páginas de 20 em 20. */
    const buscaBrapi = { termo: "", itens: [], timer: null };

    function buscarNaBrapi(termo, alvo) {
        buscaBrapi.termo = termo;
        buscaBrapi.itens = [];
        buscaBrapi.pendente = true;

        clearTimeout(buscaBrapi.timer);

        buscaBrapi.timer = setTimeout(async () => {
            const q = encodeURIComponent(termo);

            const pedir = rota => fetch(`${API_BASE_URL}/brapi/${rota}?page=1&limit=20&search=${q}`)
                .then(r => r.json())
                .then(d => (d.success && Array.isArray(d.stocks)) ? d.stocks : []);

            const [ac, fi, intl, cr, fx, fut] = await Promise.allSettled([
                pedir("listar-acoes-nacionais"),
                pedir("listar-fiis-catalogo"),
                pedir("listar-internacionais"),
                pedir("listar-criptomoedas"),
                pedir("listar-moedas"),
                pedir("listar-futuros")
            ]);

            const lista = r => r.status === "fulfilled" ? r.value : [];
            const itens = [];

            lista(ac).forEach(a => itens.push(itemDeAcao(a)));
            lista(fi).forEach(a => itens.push(itemDeFonte(a, { cls: "FIIs", sigla: "FII", cor: "yellow" })));

            lista(intl).forEach(a => {
                const nome = String(a.name);

                if (nome.endsWith("(BDR)")) {
                    itens.push(itemDeFonte(a, { cls: "Ações", sigla: "BDR", cor: "purple" }));
                } else if (nome.endsWith("(ETF)")) {
                    itens.push(itemDeFonte(a, { cls: "Ações", sigla: "ETF", cor: "blue" }));
                }
            });

            lista(cr).forEach(a => itens.push(itemDeFonte(a, { rota: "cripto", cls: "Cripto", sigla: "₿", cor: "orange" })));
            lista(fx).forEach(a => itens.push(itemDeFonte(a, { rota: "moedas", cls: "Internacional", sigla: "FX", cor: "purple" })));
            lista(fut).forEach(a => itens.push(itemDeFonte(a, { rota: "futuros", cls: "Futuros", sigla: "FUT", cor: "orange" })));

            /* ignora se o usuário já digitou outra coisa */
            if (buscaBrapi.termo !== termo) {
                return;
            }

            buscaBrapi.itens = itens;
            buscaBrapi.pendente = false;

            if (document.body.contains(alvo) && busca.trim() === termo) {
                listarBusca(alvo);
            }
        }, 400);
    }

    function listarBusca(alvo) {
        const termo = norm(busca.trim());

        if (busca.trim() !== buscaBrapi.termo) {
            buscarNaBrapi(busca.trim(), alvo);
        }

        /* tudo que o app conhece: listas fixas + ações já carregadas + favoritos */
        const todos = new Map();

        [...itensFixos(), ...acoes.map(itemDeAcao), ...buscaBrapi.itens, ...lerFavoritos()].forEach(i => todos.set(i.value, i));

        const achados = [...todos.values()].filter(i =>
            norm(i.value).includes(termo) || norm(i.name).includes(termo) || norm(i.sub).includes(termo)
        );

        const lista = achados;

        if (!lista.length) {
            alvo.innerHTML = buscaBrapi.termo === busca.trim() && !buscaBrapi.pendente
                ? `<div class="pp-empty">Nada encontrado para "${esc(busca)}". Tente o código (PETR4, MXRF11, BTC) ou parte do nome.</div>`
                : `<div class="pp-empty">Buscando "${esc(busca)}"…</div>`;
            return;
        }

        desenharLinhas(alvo, lista);
    }

    function itensFixos() {
        const itens = [];

        // Renda fixa e Tesouro Direto também aparecem na busca global.
        RENDA_FIXA.forEach(t => itens.push({
            idTitulo: t.idTitulo, value: t.value, name: t.value,
            sub: `${t.tipo} · ${t.rent}`, cls: "Renda Fixa",
            sigla: t.tipo || "CDB", cor: "cyan",
            extra: { tipo: t.tipo, rent: t.rent, resgate: t.resgate, minimo: t.minimo, tags: t.tags }
        }));
        TESOURO.forEach(t => itens.push({
            idTitulo: t.idTitulo, value: t.value, name: t.value,
            sub: `${t.tipo} · ${t.rent}`, cls: "Renda Fixa",
            sigla: "TD", cor: "blue",
            extra: { tipo: t.tipo, rent: t.rent, resgate: t.resgate, minimo: t.minimo, tags: t.tags }
        }));

        const fiisApi = FONTES_API.fiis.itens;

        (fiisApi.length ? fiisApi.map(s => s.stock) : LISTAS.fiis)
            .forEach(c => itens.push({ value: c, name: c, sub: "Fundo imobiliário", cls: "FIIs", sigla: "FII", cor: "yellow" }));
        LISTAS.etf.forEach(c => itens.push({ value: c, name: c, sub: "ETF", cls: "Ações", sigla: "ETF", cor: "blue" }));
        LISTAS.bdr.forEach(c => itens.push({ value: c, name: c, sub: "BDR", cls: "Ações", sigla: "BDR", cor: "purple" }));

        const futurosApi = FONTES_API.futuros.itens;

        futurosApi.forEach(s => itens.push({ value: s.stock, name: s.stock, sub: s.name, cls: "Futuros", sigla: "FUT", cor: "orange", rota: "futuros" }));

        const criptoApi = FONTES_API.cripto.itens;

        (criptoApi.length ? criptoApi.map(s => [s.stock, s.name]) : LISTAS.cripto)
            .forEach(([c, n]) => itens.push({ value: c, name: c, sub: n, cls: "Cripto", sigla: "₿", cor: "orange", rota: "cripto" }));

        return itens;
    }


    /* =========================
       AÇÕES NACIONAIS (API)
    ========================= */

    let acoes = [];
    let pagina = 0;
    let temMais = true;
    let carregando = false;
    let erroAcoes = "";

    /* FIIs e BDRs/ETFs também vêm da API (mesmo formato das ações) */
    const FONTES_API = {
        fiis: { rota: "listar-fiis-catalogo", itens: [], pagina: 0, temMais: true, carregando: false, erro: "" },
        intl: { rota: "listar-internacionais", itens: [], pagina: 0, temMais: true, carregando: false, erro: "" },
        cripto: { rota: "listar-criptomoedas", itens: [], pagina: 0, temMais: true, carregando: false, erro: "" },
        futuros: { rota: "listar-futuros", itens: [], pagina: 0, temMais: true, carregando: false, erro: "" }
    };

    function chaveFonte(f) {
        if (f === "fiis" || f === "cripto" || f === "futuros") {
            return f;
        }

        return (f === "etf" || f === "bdr") ? "intl" : null;
    }

    async function carregarFonte(chave) {
        const fonte = FONTES_API[chave];

        if (!fonte || fonte.carregando || !fonte.temMais) {
            return;
        }

        fonte.carregando = true;
        fonte.erro = "";

        try {
            const resp = await fetch(`${API_BASE_URL}/brapi/${fonte.rota}?page=${fonte.pagina + 1}&limit=20`);

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const dados = await resp.json();

            if (!dados.success || !Array.isArray(dados.stocks)) {
                throw new Error("Resposta inválida");
            }

            fonte.pagina += 1;
            fonte.temMais = Boolean(dados.paginacao && dados.paginacao.temProximaPagina);

            dados.stocks
                .filter(s => s.stock && !fonte.itens.some(a => a.stock === s.stock))
                .forEach(s => fonte.itens.push(s));

        } catch (erro) {
            console.error("Erro ao listar ativos:", erro);
            fonte.erro = "Não foi possível carregar a lista agora.";
        } finally {
            fonte.carregando = false;
        }
    }

    /* Cripto e futuros usam rotas próprias de cotação e histórico (ver cotacoes.js e Aportesdetalhe.js) */
    window.ASSET_ROTA = window.ASSET_ROTA || {};

    function itemDeFonte(a, params) {
        return {
            rota: params.rota,
            value: a.stock,
            name: a.stock,
            sub: a.name,
            cls: params.cls,
            sigla: params.sigla,
            cor: params.cor,
            preco: a.close,
            variacao: a.change,
            volume: a.volume,
            logo: a.logo ?? a.logourl ?? a.logoUrl ?? null
        };
    }

    /* A rota de internacionais mistura BDR e ETF: separa pelo rótulo no nome */
    function sufixoDe(f) {
        return f === "etf" ? "(ETF)" : (f === "bdr" ? "(BDR)" : null);
    }

    function itemDeAcao(a) {
        return {
            value: a.stock,
            name: a.stock,
            sub: a.name,
            cls: "Ações",
            sigla: "AÇ",
            cor: "green",
            preco: a.close,
            variacao: a.change,
            volume: a.volume,
            logo: a.logo ?? a.logourl ?? a.logoUrl ?? null
        };
    }

    async function carregarAcoes() {
        if (carregando || !temMais) {
            return;
        }

        carregando = true;
        erroAcoes = "";

        try {
            const resp = await fetch(`${API_BASE_URL}/brapi/listar-acoes-nacionais?page=${pagina + 1}&limit=20`);

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const dados = await resp.json();

            if (!dados.success || !Array.isArray(dados.stocks)) {
                throw new Error("Resposta inválida");
            }

            pagina += 1;
            temMais = Boolean(dados.paginacao && dados.paginacao.temProximaPagina);

            dados.stocks
                .filter(s => s.stock && !acoes.some(a => a.stock === s.stock))
                .forEach(s => acoes.push(s));

        } catch (erro) {
            console.error("Erro ao listar ações:", erro);
            erroAcoes = "Não foi possível carregar as ações agora.";
        } finally {
            carregando = false;
        }
    }

    function irRanking(alvo, filtro) {
        alvo.innerHTML = `<div class="pp-empty">Carregando...</div>`;

        const pronto = acoes.length ? Promise.resolve() : carregarAcoes();

        pronto.then(() => {
            if (!document.body.contains(alvo)) {
                return;
            }

            if (!acoes.length) {
                alvo.innerHTML = `<div class="pp-empty">${esc(erroAcoes || "Nenhuma ação disponível.")}</div>`;
                return;
            }

            const ordenadas = [...acoes].sort((a, b) =>
                filtro === "negociadas"
                    ? (Number(b.volume) || 0) - (Number(a.volume) || 0)
                    : (Number(a.change) || 0) - (Number(b.change) || 0)
            );

            desenharLinhas(alvo, ordenadas.slice(0, 20).map(itemDeAcao));
        });
    }


    /* =========================
       CATÁLOGO PAGINADO - ACCURACY
       Utiliza as rotas BRAPI existentes no backend.
       Não baixa todos os ativos de uma vez.
    ========================= */

    function telaCatalogo(params) {
        const configs = {
            acoes: { rota: "listar-acoes-nacionais", ordem: "volume", nome: "Ações nacionais" },
            fiis: { rota: "listar-fiis-catalogo", ordem: "volume", nome: "Fundos imobiliários" },
            bdr: { rota: "listar-internacionais", ordem: "volume", nome: "BDRs" },
            etf: { rota: "listar-internacionais", ordem: "volume", nome: "ETFs" },
            cripto: { rota: "listar-criptomoedas", ordem: "rank", nome: "Criptomoedas" },
            moedas: { rota: "listar-moedas", ordem: "rank", nome: "Moedas e câmbio" },
            futuros: { rota: "listar-futuros", ordem: "expirationDate", nome: "Contratos futuros" }
        };
        const cfg = configs[params.fonte];
        if (!cfg) return;
        let paginaAtual = 1;
        let proxima = false;
        let totalPaginas = null;
        let formato = localStorage.getItem("accuracy_catalogo_visual") === "tabela" ? "tabela" : "cards";
        let ordenacao = cfg.ordem;
        let direcao = cfg.ordem === "expirationDate" ? "asc" : "desc";
        let numeroPedido = 0;
        let itensAtuais = [];
        let filtro = "todos";

        root.innerHTML = `
            ${cabecalho(cfg.nome, true)}
            <div class="ac-catalog-sub">Explore os ativos disponíveis pela API e selecione um para investir.</div>
            <div class="ac-catalog-toolbar">
                <div class="ac-view-toggle" aria-label="Visualização">
                    <button type="button" data-view="cards">▦ Cards</button>
                    <button type="button" data-view="tabela">☷ Tabela</button>
                </div>
                <label class="ac-catalog-select">Ordenar
                    <select id="acCatalogSort">
                        <option value="padrao">Destaques</option>
                        <option value="nome">Nome A–Z</option>
                        <option value="precoAlta">Maior preço</option>
                        <option value="precoBaixa">Menor preço</option>
                    </select>
                </label>
                <label class="ac-catalog-select">Variação
                    <select id="acCatalogFilter">
                        <option value="todos">Todos</option>
                        <option value="alta">Em alta</option>
                        <option value="baixa">Em baixa</option>
                    </select>
                </label>
            </div>
            <p class="ac-catalog-status" id="acCatalogStatus" role="status"></p>
            <div id="acCatalogResult"></div>
            <nav class="ac-catalog-pager" aria-label="Páginas de ativos">
                <button type="button" id="acCatalogPrev">‹ Anterior</button>
                <span id="acCatalogPage">Página 1</span>
                <button type="button" id="acCatalogNext">Próxima ›</button>
            </nav>
        `;

        const resultado = document.getElementById("acCatalogResult");
        const status = document.getElementById("acCatalogStatus");
        const anterior = document.getElementById("acCatalogPrev");
        const seguinte = document.getElementById("acCatalogNext");
        const paginaEl = document.getElementById("acCatalogPage");
        const sortSelect = document.getElementById("acCatalogSort");
        if (["cripto", "futuros", "moedas"].includes(params.fonte)) {
            sortSelect.disabled = true;
            sortSelect.title = "Ordenação padrão da categoria";
        }

        function atualizarBotoes() {
            root.querySelectorAll("[data-view]").forEach(botao => {
                botao.classList.toggle("active", botao.dataset.view === formato);
                botao.setAttribute("aria-pressed", String(botao.dataset.view === formato));
            });
            anterior.disabled = paginaAtual <= 1;
            seguinte.disabled = !proxima;
            paginaEl.textContent = totalPaginas
                ? `Página ${paginaAtual} de ${totalPaginas}` : `Página ${paginaAtual}`;
        }

        function formatarPreco(v) {
            return Number.isFinite(Number(v)) && v != null && v !== ""
                ? brl(Number(v)) : "Cotação indisponível";
        }

        function desenharCatalogo() {
            const itens = itensAtuais.filter(item => {
                const v = Number(item.variacao);
                return filtro === "todos" || (Number.isFinite(v) &&
                    (filtro === "alta" ? v > 0 : v < 0));
            });
            if (!itens.length) {
                resultado.innerHTML = '<div class="pp-empty">Nenhum ativo nesta página com esse filtro.</div>';
                return;
            }
            if (formato === "cards") {
                resultado.innerHTML = `<div class="ac-catalog-grid">${itens.map((item, n) => {
                    const v = Number(item.variacao);
                    const variacao = Number.isFinite(v) ? `${v > 0 ? "+" : ""}${v.toFixed(2).replace(".", ",")}%` : "—";
                    return `<button type="button" class="ac-asset-card" data-asset="${n}">
                        <div class="ac-asset-head">
                            ${logoAtivo(item)}
                            <div class="ac-asset-name"><strong>${esc(item.value)}</strong><small title="${esc(item.sub || "")}">${esc(item.sub || item.cls)}</small></div>
                        </div>
                        <div class="ac-asset-bottom"><strong>${esc(formatarPreco(item.preco))}</strong>
                            <span class="ac-asset-change ${v > 0 ? "up" : v < 0 ? "down" : "flat"}">${esc(variacao)}</span>
                        </div>
                    </button>`;
                }).join("")}</div>`;
            } else {
                resultado.innerHTML = `<div class="ac-catalog-table-wrap"><table class="ac-catalog-table">
                    <thead><tr><th>Código</th><th>Ativo</th><th>Preço</th><th>Variação</th><th></th></tr></thead>
                    <tbody>${itens.map((item, n) => `<tr data-asset="${n}">
                        <td><span class="ac-table-ticker">${logoAtivo(item, "ac-asset-symbol ac-logo-small")}<strong>${esc(item.value)}</strong></span></td><td>${esc(item.sub || item.cls)}</td>
                        <td>${esc(formatarPreco(item.preco))}</td>
                        <td class="${Number(item.variacao) > 0 ? "ac-up" : "ac-down"}">${item.variacao == null ? "—" : esc(Number(item.variacao).toFixed(2).replace(".", ",") + "%")}</td>
                        <td><button type="button" class="ac-choose">Ver</button></td>
                    </tr>`).join("")}</tbody></table></div>`;
            }
            resultado.querySelectorAll("[data-asset]").forEach(el => {
                el.addEventListener("click", () => escolher(itens[Number(el.dataset.asset)]));
            });
        }

        async function carregar(pagina = 1) {
            const pedido = ++numeroPedido;
            status.textContent = "Carregando ativos...";
            resultado.innerHTML = '<div class="pp-empty">Consultando a BRAPI...</div>';
            anterior.disabled = true;
            seguinte.disabled = true;
            const query = new URLSearchParams({
                page: String(pagina), limit: "20", sortBy: ordenacao, sortOrder: direcao
            });
            try {
                const response = await fetch(`${API_BASE_URL}/brapi/${cfg.rota}?${query}`);
                const dados = await response.json();
                if (!response.ok || !dados.success || !Array.isArray(dados.stocks)) {
                    throw new Error(dados.message || "Falha ao carregar ativos.");
                }
                if (pedido !== numeroPedido || !document.body.contains(resultado)) return;
                paginaAtual = pagina;
                const lista = dados.stocks;
                const filtrados = params.fonte === "bdr" ? lista.filter(x => /\(BDR\)$/i.test(x.name || ""))
                    : params.fonte === "etf" ? lista.filter(x => /\(ETF\)$/i.test(x.name || "")) : lista;
                itensAtuais = filtrados.map(x => itemDeFonte(x, {
                    cls: params.cls, cor: params.cor, sigla: params.sigla,
                    rota: ["cripto", "futuros", "moedas"].includes(params.fonte) ? params.fonte : undefined
                }));
                const pg = dados.paginacao || {};
                totalPaginas = Number(pg.totalPaginas) || null;
                proxima = typeof pg.temProximaPagina === "boolean"
                    ? pg.temProximaPagina : (totalPaginas ? pagina < totalPaginas : lista.length === 20);
                status.textContent = `Ativos da página ${paginaAtual} · ${itensAtuais.length} exibidos`;
                desenharCatalogo();
            } catch (erro) {
                if (pedido !== numeroPedido) return;
                status.textContent = "Não foi possível consultar os ativos.";
                resultado.textContent = erro.message;
                proxima = false;
            } finally {
                if (pedido === numeroPedido) atualizarBotoes();
            }
        }

        root.querySelectorAll("[data-view]").forEach(botao => {
            botao.addEventListener("click", () => {
                formato = botao.dataset.view;
                localStorage.setItem("accuracy_catalogo_visual", formato);
                atualizarBotoes(); desenharCatalogo();
            });
        });
        sortSelect.addEventListener("change", () => {
            const escolhas = {
                padrao: [cfg.ordem, cfg.ordem === "expirationDate" ? "asc" : "desc"],
                nome: [params.fonte === "fiis" ? "name" : "name", "asc"],
                precoAlta: [params.fonte === "fiis" ? "price" : "close", "desc"],
                precoBaixa: [params.fonte === "fiis" ? "price" : "close", "asc"]
            };
            [ordenacao, direcao] = escolhas[sortSelect.value];
            // Futuros usa outros critérios de ordenação.
            if (params.fonte === "futuros" && sortSelect.value !== "padrao") {
                sortSelect.value = "padrao";
                [ordenacao, direcao] = escolhas.padrao;
            }
            carregar(1);
        });
        document.getElementById("acCatalogFilter").addEventListener("change", e => {
            filtro = e.target.value;
            desenharCatalogo();
        });
        anterior.addEventListener("click", () => { if (paginaAtual > 1) carregar(paginaAtual - 1); });
        seguinte.addEventListener("click", () => { if (proxima) carregar(paginaAtual + 1); });
        atualizarBotoes(); carregar(1);
    }

    /* =========================
       LISTA DE ATIVOS DE UMA CATEGORIA
    ========================= */

    function telaLista(params) {
        // Catálogo em cards/tabela com paginação da mesma API usada no Android.
        if (["acoes", "fiis", "etf", "bdr", "cripto", "futuros", "moedas"].includes(params.fonte)) {
            return telaCatalogo(params);
        }

        root.innerHTML = `
            ${cabecalho(params.titulo, true)}
            <div id="ppCorpo"></div>
        `;

        const chave = chaveFonte(params.fonte);

        function itens() {
            const f = params.fonte;

            if (chave) {
                const fonte = FONTES_API[chave];
                const sufixo = sufixoDe(f);

                const daApi = fonte.itens
                    .filter(s => !sufixo || String(s.name).endsWith(sufixo))
                    .map(s => itemDeFonte(s, { ...params, rota: (chave === "cripto" || chave === "futuros") ? chave : undefined }));

                /* API fora do ar e nada carregado: cai na lista fixa abaixo */
                if (daApi.length || !fonte.erro) {
                    return daApi;
                }
            }

            if (f === "acoes") {
                return acoes.map(itemDeAcao);
            }

            if (["fiis", "etf", "bdr"].includes(f)) {
                return LISTAS[f].map(c => ({
                    value: c, name: c, sub: params.titulo, cls: params.cls, sigla: params.sigla, cor: params.cor
                }));
            }

            return LISTAS[f].map(([nome, sub]) => ({
                value: nome, name: nome, sub, cls: params.cls, sigla: params.sigla, cor: params.cor
            }));
        }

        function corpo() {
            const alvo = document.getElementById("ppCorpo");
            const termo = norm(busca.trim());

            const lista = itens().filter(i =>
                !termo || norm(i.value).includes(termo) || norm(i.sub).includes(termo)
            );

            if (!lista.length) {
                alvo.innerHTML = `<div class="pp-empty">${carregando ? "Carregando..." : esc(erroAcoes || "Nenhum ativo encontrado.")}</div>`;
            } else {
                desenharLinhas(alvo, lista);
            }

            if (chave && FONTES_API[chave].temMais && !FONTES_API[chave].erro) {
                const maisApi = document.createElement("button");
                maisApi.type = "button";
                maisApi.className = "pp-more";
                maisApi.textContent = "Carregar mais";
                maisApi.addEventListener("click", async () => {
                    maisApi.textContent = "Carregando...";
                    await carregarAteTer();
                    corpo();
                });
                alvo.querySelector(".pp-list")?.appendChild(maisApi) || alvo.appendChild(maisApi);
            }

            if (params.fonte === "acoes" && temMais) {
                const mais = document.createElement("button");
                mais.type = "button";
                mais.className = "pp-more";
                mais.textContent = "Carregar mais ações";
                mais.addEventListener("click", async () => {
                    mais.textContent = "Carregando...";
                    await carregarAcoes();
                    corpo();
                });
                alvo.querySelector(".pp-list")?.appendChild(mais) || alvo.appendChild(mais);
            }
        }


        /* busca páginas até aparecer algo do tipo pedido (BDR/ETF vêm misturados) */
        async function carregarAteTer() {
            for (let i = 0; i < 5; i++) {
                const antes = itens().length;

                await carregarFonte(chave);

                if (FONTES_API[chave].erro || !FONTES_API[chave].temMais || itens().length > antes) {
                    break;
                }
            }
        }

        if (params.fonte === "acoes" && !acoes.length) {
            document.getElementById("ppCorpo").innerHTML = `<div class="pp-empty">Carregando...</div>`;
            carregarAcoes().then(corpo);
        } else if (chave && !FONTES_API[chave].itens.length && FONTES_API[chave].temMais) {
            document.getElementById("ppCorpo").innerHTML = `<div class="pp-empty">Carregando...</div>`;
            carregarAteTer().then(corpo);
        } else {
            corpo();
        }
    }

    function desenharLinhas(alvo, lista) {

        alvo.innerHTML = `<div class="pp-list">${lista.map((i, n) => {

            const subida = Number(i.variacao) >= 0;
            const preco = i.preco != null
                ? `<div class="pp-price ${subida ? "up" : "down"}">${esc(brl(i.preco))}<br>${subida ? "▲" : "▼"} ${esc(Number(i.variacao || 0).toFixed(2).replace(".", ","))}%</div>`
                : "";

            return `
                <div class="pp-row" data-n="${n}">
                    ${logoAtivo(i, "pp-badge ac-logo-small")}
                    <div class="pp-row-info">
                        <strong>${esc(i.name)}</strong>
                        <small>${esc(i.sub || i.cls)}</small>
                    </div>
                    ${preco}
                    <button type="button" class="pp-star ${ehFavorito(i.value) ? "on" : ""}" data-star="${n}" aria-label="Favoritar">
                        <i class="bi ${ehFavorito(i.value) ? "bi-star-fill" : "bi-star"}"></i>
                    </button>
                </div>
            `;
        }).join("")}</div>`;

        alvo.querySelectorAll(".pp-row").forEach(linha => {
            linha.addEventListener("click", e => {
                const item = lista[Number(linha.dataset.n)];

                if (e.target.closest("[data-star]")) {
                    alternarFavorito(item);
                    desenharLinhas(alvo, lista);

                    /* estrela "pula" ao favoritar */
                    const estrela = alvo.querySelector(`[data-star="${linha.dataset.n}"]`);

                    if (estrela && ehFavorito(item.value)) {
                        estrela.classList.add("pop");
                    }

                    return;
                }

                escolher(item);
            });
        });
    }


    /* =========================
       TELA 3 - RENDA FIXA / TESOURO (cartões)
    ========================= */

    function escolherFixa(i, params) {
        escolher({
            idTitulo: i.idTitulo,
            value: i.value,
            name: i.value,
            sub: `${i.tipo} · ${i.rent}`,
            cls: params.cls,
            sigla: params.sigla,
            cor: params.cor,
            extra: { tipo: i.tipo, rent: i.rent, resgate: i.resgate, minimo: i.minimo, tags: i.tags }
        });
    }

    function telaCards(params) {
        // Títulos são cadastrados no banco Accuracy, não no catálogo BRAPI.
        // O backend não retorna logos para esses títulos.
        let formato = localStorage.getItem("accuracy_catalogo_visual") === "tabela" ? "tabela" : "cards";
        let pagina = 1;
        const limite = 20;
        let ordem = "padrao";

        root.innerHTML = `
            ${cabecalho(params.titulo, true)}
            <div class="ac-catalog-sub">Títulos registrados na Accuracy. Rentabilidades conforme os dados cadastrados no banco.</div>
            <div class="ac-catalog-toolbar">
                <div class="ac-view-toggle" aria-label="Visualização">
                    <button type="button" data-rf-view="cards">▦ Cards</button>
                    <button type="button" data-rf-view="tabela">☷ Tabela</button>
                </div>
                <label class="ac-catalog-select">Ordenar
                    <select id="acRfSort"><option value="padrao">Padrão</option><option value="nome">Nome A–Z</option></select>
                </label>
            </div>
            <p class="ac-catalog-status" id="acRfStatus" role="status"></p>
            <div id="acRfResultado"></div>
            <nav class="ac-catalog-pager" aria-label="Páginas de títulos">
                <button type="button" id="acRfPrev">‹ Anterior</button>
                <span id="acRfPagina"></span>
                <button type="button" id="acRfNext">Próxima ›</button>
            </nav>`;

        const resultado = document.getElementById("acRfResultado");
        const status = document.getElementById("acRfStatus");
        const prev = document.getElementById("acRfPrev");
        const next = document.getElementById("acRfNext");
        const pageLabel = document.getElementById("acRfPagina");

        function desenharRf() {
            if (!document.body.contains(resultado)) return;
            // Apenas títulos retornados do banco; exemplos não são ofertas reais.
            const registrados = params.itens.filter(item => item.idTitulo != null);
            const lista = ordem === "nome"
                ? [...registrados].sort((a, b) => a.value.localeCompare(b.value, "pt-BR"))
                : registrados;
            const paginas = Math.max(1, Math.ceil(lista.length / limite));
            pagina = Math.min(pagina, paginas);
            const itens = lista.slice((pagina - 1) * limite, pagina * limite);
            status.textContent = `${lista.length} título(s) cadastrado(s) no banco`;
            pageLabel.textContent = `Página ${pagina} de ${paginas}`;
            prev.disabled = pagina <= 1;
            next.disabled = pagina >= paginas;
            root.querySelectorAll("[data-rf-view]").forEach(b => {
                b.classList.toggle("active", b.dataset.rfView === formato);
                b.setAttribute("aria-pressed", String(b.dataset.rfView === formato));
            });
            if (!lista.length) {
                resultado.innerHTML = '<div class="pp-empty">Nenhum título desta categoria foi retornado pelo banco da Accuracy.</div>';
                return;
            }
            if (formato === "cards") {
                resultado.innerHTML = `<div class="ac-catalog-grid">${itens.map((item, n) => `
                    <button type="button" class="ac-asset-card" data-rf="${n}">
                        <div class="ac-asset-head">
                            ${logoAtivo({ ...item, logo: null })}
                            <div class="ac-asset-name"><strong>${esc(item.value)}</strong>
                                <small>${esc(item.tipo || "Renda fixa")}</small></div>
                        </div>
                        <div class="ac-rf-details"><strong>${esc(item.rent || "Rentabilidade não informada")}</strong>
                            <small>Resgate: ${esc(item.resgate || "—")}</small>
                            ${item.minimo != null ? `<small>Aplicação mínima: ${esc(brl(item.minimo))}</small>` : ""}
                        </div>
                    </button>`).join("")}</div>`;
            } else {
                resultado.innerHTML = `<div class="ac-catalog-table-wrap"><table class="ac-catalog-table">
                    <thead><tr><th>Título</th><th>Tipo</th><th>Rentabilidade</th><th>Resgate</th><th></th></tr></thead>
                    <tbody>${itens.map((item, n) => `<tr data-rf="${n}"><td>${esc(item.value)}</td>
                    <td>${esc(item.tipo)}</td><td>${esc(item.rent)}</td><td>${esc(item.resgate)}</td>
                    <td><button type="button" class="ac-choose">Ver</button></td></tr>`).join("")}</tbody></table></div>`;
            }
            resultado.querySelectorAll("[data-rf]").forEach(el => {
                el.addEventListener("click", () => escolherFixa(itens[Number(el.dataset.rf)], params));
            });
        }

        root.querySelectorAll("[data-rf-view]").forEach(btn => btn.addEventListener("click", () => {
            formato = btn.dataset.rfView;
            localStorage.setItem("accuracy_catalogo_visual", formato);
            desenharRf();
        }));
        document.getElementById("acRfSort").addEventListener("change", e => {
            ordem = e.target.value; pagina = 1; desenharRf();
        });
        prev.addEventListener("click", () => { if (pagina > 1) { pagina--; desenharRf(); } });
        next.addEventListener("click", () => { pagina++; desenharRf(); });
        window.addEventListener("accuracy:rf-carregada", desenharRf, { once: true });
        desenharRf();
    }


    /* =========================
       INÍCIO
    ========================= */

    /* Se o select já tinha um valor padrão (ex.: PETR4), o formulário
       continua oculto até a pessoa escolher um produto. */
    irPara("produtos");

})();
