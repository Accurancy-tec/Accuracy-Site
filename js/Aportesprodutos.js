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
        { id: "bolsa", sigla: "B3", cor: "green", titulo: "Bolsa", desc: "Ações, FIIs e BDRs" },
        { id: "cripto", sigla: "BTC", cor: "orange", titulo: "Cripto", desc: "Bitcoin e mais" },
        { id: "internacional", sigla: "USD", cor: "purple", titulo: "Internacional", desc: "Dólar e exterior" },
        { id: "fundos", sigla: "FDO", cor: "yellow", titulo: "Fundos", desc: "Multimercados" }
    ];

    const CATEGORIAS_VARIAVEL = [
        { id: "acoes", sigla: "AÇ", cor: "green", titulo: "Ações Nacionais", desc: "Empresas listadas na B3", cls: "Ações" },
        { id: "fiis", sigla: "FII", cor: "yellow", titulo: "Fundos Imobiliários", desc: "FIIs", cls: "FIIs" },
        { id: "futuros", sigla: "FUT", cor: "orange", titulo: "Contratos Futuros", desc: "Índice, dólar e criptos", cls: "Outros" },
        { id: "bdr", sigla: "BDR", cor: "purple", titulo: "Ações e ETFs Internacionais", desc: "BDRs", cls: "Ações" },
        { id: "etf", sigla: "ETF", cor: "blue", titulo: "ETFs", desc: "Fundos de índices de ações e outros", cls: "Ações" }
    ];

    /* Listas fixas (as ações nacionais vêm da API) */
    const LISTAS = {
        fiis: ["XPML11", "HGLG11", "MXRF11", "KNRI11", "VISC11", "XPLG11", "BTLG11", "HGRU11"],
        etf: ["BOVA11", "IVVB11", "SMAL11", "HASH11", "GOLD11", "DIVO11"],
        bdr: ["AAPL34", "MSFT34", "AMZO34", "GOGL34", "NVDC34", "TSLA34", "MELI34"],
        futuros: [
            ["WIN", "Mini Índice Bovespa"],
            ["WDO", "Mini Dólar"],
            ["BIT", "Bitcoin Futuro"]
        ],
        cripto: [
            ["Bitcoin", "BTC"],
            ["Ethereum", "ETH"],
            ["Solana", "SOL"],
            ["XRP", "XRP"]
        ],
        internacional: [
            ["Dólar", "USD / BRL"],
            ["Euro", "EUR / BRL"],
            ["S&P 500", "Índice americano"],
            ["Nasdaq 100", "Índice americano"]
        ],
        fundos: [
            ["Fundo Renda Fixa", "Renda fixa"],
            ["Fundo de Ações", "Renda variável"],
            ["Fundo Multimercado", "Multimercado"]
        ]
    };

    /* Exemplos de renda fixa e tesouro: confira os dados reais antes de publicar */
    const RENDA_FIXA = [
        {
            value: "LCA Pós-Fixado", tipo: "LCA",
            tags: ["Isento de IR"],
            rent: "88% CDI", resgate: "no vencimento", minimo: 1052
        },
        {
            value: "CDB Liq. Diária", tipo: "CDB",
            tags: ["Garantia FGC"],
            rent: "101,5% CDI", resgate: "diário", minimo: 20
        },
        {
            value: "CDB Limite Garantido", tipo: "CDB",
            tags: ["Garantia FGC"],
            rent: "101,5% CDI", resgate: "em 2 dias úteis", minimo: 100
        }
    ];

    const TESOURO = [
        {
            value: "Tesouro Selic", tipo: "Pós-fixado",
            tags: ["Título público"], rent: "Taxa Selic", resgate: "Diário (D+1)"
        },
        {
            value: "Tesouro IPCA+", tipo: "Híbrido",
            tags: ["Título público"], rent: "IPCA + taxa", resgate: "Diário, a mercado"
        },
        {
            value: "Tesouro Prefixado", tipo: "Prefixado",
            tags: ["Título público"], rent: "Taxa fixa", resgate: "Diário, a mercado"
        }
    ];


    /* Renda fixa e Tesouro: troca os exemplos pelos títulos cadastrados na API */
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

            /* só troca se a API trouxe algo; senão ficam os exemplos */
            if (rf.length) {
                RENDA_FIXA.splice(0, RENDA_FIXA.length, ...rf);
            }

            if (td.length) {
                TESOURO.splice(0, TESOURO.length, ...td);
            }

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
            lista.push({ value: item.value, name: item.name, sub: item.sub, cls: item.cls, sigla: item.sigla, cor: item.cor });
        }

        gravarFavoritos(lista);
    }


    /* =========================
       ESCOLHER O ATIVO
    ========================= */

    function escolher(item) {

        /* categoria usada por classOf() ao registrar o aporte */
        ASSET_CLASS[item.value] = item.cls;

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
            <span class="pp-badge ${esc(item.cor || "blue")}">${esc(item.sigla || "AT")}</span>
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

    function campoBusca(placeholder) {
        return `
            <div class="pp-search">
                <i class="bi bi-search"></i>
                <input type="text" id="ppBusca" placeholder="${esc(placeholder)}" value="${esc(busca)}" autocomplete="off">
            </div>
        `;
    }

    function ligarBusca(aoDigitar) {
        const campo = document.getElementById("ppBusca");

        if (!campo) {
            return;
        }

        campo.addEventListener("input", () => {
            busca = campo.value;
            aoDigitar();
        });
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
                    <td><strong>${esc(i.value)}</strong></td>
                    <td>${esc(nomeLimpo(i.sub))}</td>
                    <td class="muted">${esc(i.categoria)}</td>
                    <td class="num">${i.preco != null ? esc(brl(i.preco)) : "—"}</td>
                    <td class="center"><span class="v2-delta ${v.cls}">${esc(v.texto)}</span></td>
                    <td class="num"><button type="button" class="v2-see" data-ver="${n}">Ver</button></td>
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

        alvo.innerHTML = RENDA_FIXA.slice(0, 3).map((i, n) => `
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
                    <table class="v2-table">
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

        const campo = document.getElementById("v2Search");

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

    /* busca vinda de outra página: aportes.php?q=PETR */
    (function buscaInicial() {
        const q = new URLSearchParams(window.location.search).get("q");
        const campo = document.getElementById("v2Search");

        if (q && campo) {
            campo.value = q;
            setTimeout(() => buscarTopo(q), 0);
        }
    })();


    function abrirProduto(id) {
        switch (id) {
            case "fixa":
                return irPara("cards", { titulo: "Renda fixa", itens: RENDA_FIXA, cls: "Renda Fixa", sigla: "CDB", cor: "cyan", placeholder: "Buscar título" });
            case "tesouro":
                return irPara("cards", { titulo: "Tesouro Direto", itens: TESOURO, cls: "Renda Fixa", sigla: "TD", cor: "blue", placeholder: "Buscar título" });
            case "bolsa":
            case "variavel":
                return irPara("variavel");
            case "cripto":
                return irPara("lista", { titulo: "Cripto", fonte: "cripto", cls: "Cripto", sigla: "₿", cor: "orange" });
            case "internacional":
                return irPara("lista", { titulo: "Internacional", fonte: "internacional", cls: "Outros", sigla: "USD", cor: "purple" });
            case "fundos":
                return irPara("lista", { titulo: "Fundos", fonte: "fundos", cls: "Outros", sigla: "FDO", cor: "yellow" });
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
            ${campoBusca("Empresa ou código do ativo")}

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

        ligarBusca(corpo);
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

    function listarBusca(alvo) {
        const termo = norm(busca.trim());

        /* tudo que o app conhece: listas fixas + ações já carregadas + favoritos */
        const todos = new Map();

        [...itensFixos(), ...acoes.map(itemDeAcao), ...lerFavoritos()].forEach(i => todos.set(i.value, i));

        const achados = [...todos.values()].filter(i =>
            norm(i.value).includes(termo) || norm(i.name).includes(termo) || norm(i.sub).includes(termo)
        );

        /* ticker que não está na lista: permite usar mesmo assim */
        const ticker = busca.trim().toUpperCase();
        const extra = (/^[A-Z0-9]{4,7}$/.test(ticker) && !todos.has(ticker))
            ? [{ value: ticker, name: ticker, sub: "Ativo informado", cls: "Ações", sigla: ticker.slice(0, 3), cor: "blue" }]
            : [];

        const lista = [...achados, ...extra];

        if (!lista.length) {
            alvo.innerHTML = `<div class="pp-empty">Nada encontrado para "${esc(busca)}".</div>`;
            return;
        }

        desenharLinhas(alvo, lista);
    }

    function itensFixos() {
        const itens = [];

        const fiisApi = FONTES_API.fiis.itens;

        (fiisApi.length ? fiisApi.map(s => s.stock) : LISTAS.fiis)
            .forEach(c => itens.push({ value: c, name: c, sub: "Fundo imobiliário", cls: "FIIs", sigla: "FII", cor: "yellow" }));
        LISTAS.etf.forEach(c => itens.push({ value: c, name: c, sub: "ETF", cls: "Ações", sigla: "ETF", cor: "blue" }));
        LISTAS.bdr.forEach(c => itens.push({ value: c, name: c, sub: "BDR", cls: "Ações", sigla: "BDR", cor: "purple" }));

        const futurosApi = FONTES_API.futuros.itens;

        (futurosApi.length ? futurosApi.map(s => [s.stock, s.name]) : LISTAS.futuros)
            .forEach(([c, n]) => itens.push({ value: c, name: c, sub: n, cls: "Outros", sigla: "FUT", cor: "orange", rota: "futuros" }));

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
        fiis: { rota: "listar-fiis", itens: [], pagina: 0, temMais: true, carregando: false, erro: "" },
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
            volume: a.volume
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
            volume: a.volume
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
       LISTA DE ATIVOS DE UMA CATEGORIA
    ========================= */

    function telaLista(params) {

        root.innerHTML = `
            ${cabecalho(params.titulo, true)}
            ${campoBusca("Buscar ativo")}
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

        ligarBusca(corpo);

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
                    <span class="pp-badge ${esc(i.cor || "blue")}">${esc(i.sigla || "AT")}</span>
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

        root.innerHTML = `
            ${cabecalho(params.titulo, true)}
            ${campoBusca(params.placeholder)}
            <div id="ppCorpo" class="pp-list"></div>
        `;

        function corpo() {
            const alvo = document.getElementById("ppCorpo");
            const termo = norm(busca.trim());

            const lista = params.itens.filter(i =>
                !termo || norm(i.value).includes(termo) || norm(i.tipo).includes(termo)
            );

            if (!lista.length) {
                alvo.innerHTML = `<div class="pp-empty">Nenhum título encontrado.</div>`;
                return;
            }

            alvo.innerHTML = lista.map((i, n) => `
                <div class="pp-fixa" data-n="${n}">
                    <div class="pp-fixa-tipo">${esc(i.tipo)}</div>
                    <h4>${esc(i.value)}</h4>
                    <div class="pp-tags">
                        ${i.nivel ? `<span>${esc(i.nivel)}</span>` : ""}
                        ${i.tags.map(t => `<span>${esc(t)}</span>`).join("")}
                    </div>
                    <div class="pp-kv"><span>Rentabilidade</span><strong class="green">${esc(i.rent)}</strong></div>
                    <div class="pp-kv"><span>Resgate</span><strong>${esc(i.resgate)}</strong></div>
                    ${i.minimo != null ? `<div class="pp-kv"><span>Aplicação mínima</span><strong>${esc(brl(i.minimo))}</strong></div>` : ""}
                </div>
            `).join("");

            alvo.querySelectorAll(".pp-fixa").forEach(card => card.addEventListener("click", () => {
                escolherFixa(lista[Number(card.dataset.n)], params);
            }));
        }

        ligarBusca(corpo);
        corpo();
    }


    /* =========================
       INÍCIO
    ========================= */

    /* Se o select já tinha um valor padrão (ex.: PETR4), o formulário
       continua oculto até a pessoa escolher um produto. */
    irPara("produtos");

})();