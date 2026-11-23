/* =========================================================
   APORTES - DETALHES DO ATIVO (carregar ANTES do aportesProdutos.js)

   Aparece quando a pessoa escolhe um ativo para fazer o aporte:

     lista de ativos  ->  DETALHES DO ATIVO  ->  formulário "Novo aporte"

   Mostra: preço atual e variação, situação do mercado, "Minha
   posição" (preço médio, quantidade, posição, rentabilidade),
   gráfico de preços (1S / 1M / 3M / 6M), saldo para investir e os
   botões Vender / Comprar (que abrem o formulário já com o tipo).

   Uso (feito pelo aportesProdutos.js):
     AtivoDetalhe.desenhar(raiz, item, {
         ehFavorito, alternarFavorito, aoAcao(tipo)
     })

   Dados:
     - cotação ......... GET /brapi/get-quote
     - histórico ....... GET /brapi/historico-acoes
     - posição / saldo . ResumoCarteiras.load() (mesmos dados da Carteira)
========================================================= */

const AtivoDetalhe = (function () {

    "use strict";

    const API = (typeof API_BASE_URL !== "undefined")
        ? API_BASE_URL
        : "https://accuracyappapi.onrender.com";

    const PERIODOS = [
        { rotulo: "1S", range: "7d" },
        { rotulo: "1M", range: "1mo" },
        { rotulo: "3M", range: "3mo" },
        { rotulo: "6M", range: "6mo" }
    ];

    const PERIODO_PADRAO = 2;   /* 3M */

    const cacheHistorico = new Map();


    /* =========================
       UTILITÁRIOS
    ========================= */

    function esc(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function num(valor, casas = 2) {
        return Number(valor).toLocaleString("pt-BR", {
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        });
    }

    function reais(valor) {
        return (valor < 0 ? "R$ -" : "R$ ") + num(Math.abs(valor));
    }

    function porcento(valor) {
        return `${num(Math.abs(valor))}%`;
    }

    function seta(valor) {
        return valor >= 0 ? "▲" : "▼";
    }

    function hora(data) {
        return String(data.getHours()).padStart(2, "0") + "h" +
            String(data.getMinutes()).padStart(2, "0");
    }

    function quantidade(valor) {
        return Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 8 });
    }


    /* =========================
       MERCADO ABERTO / FECHADO
       Bolsa (ações e FIIs): dias úteis, 10h às 18h (Brasília).
       Cripto: sempre aberto. Outros: sem indicação.
    ========================= */

    function mercado(item) {

        if (item.cls === "Cripto") {
            return { aberto: true, texto: "Mercado aberto" };
        }

        if (item.cls !== "Ações" && item.cls !== "FIIs") {
            return null;
        }

        const partes = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/Sao_Paulo",
            weekday: "short",
            hour: "numeric",
            minute: "numeric",
            hour12: false
        }).formatToParts(new Date());

        const pega = tipo => partes.find(p => p.type === tipo).value;

        const minutos = (Number(pega("hour")) % 24) * 60 + Number(pega("minute"));
        const diaUtil = !["Sat", "Sun"].includes(pega("weekday"));
        const aberto = diaUtil && minutos >= 10 * 60 && minutos < 18 * 60;

        return { aberto, texto: aberto ? "Mercado aberto" : "Mercado fechado" };
    }


    /* =========================
       DADOS (API)
    ========================= */

    async function buscarCotacao(simbolo) {

        const tipo = (window.ASSET_ROTA || {})[simbolo];
        const rota = tipo === "cripto" ? "get-crypto-quote" : (tipo === "futuros" ? "get-futures-quote" : (tipo === "moedas" ? "get-currency-quote" : "get-quote"));

        const resp = await fetch(`${API}/brapi/${rota}?symbol=${encodeURIComponent(simbolo)}`);

        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
        }

        const json = await resp.json();
        const resultado = json.results && json.results[0];

        if (!resultado) {
            throw new Error("Sem resultado");
        }

        /* a API devolve {data:{...}}; aceita também o formato direto da Brapi */
        const dados = resultado.data || resultado;
        const preco = Number(dados.regularMarketPrice);

        if (!isFinite(preco)) {
            throw new Error("Sem preço");
        }

        const variacao = Number(dados.regularMarketChangePercent);

        return {
            preco,
            variacao: dados.regularMarketChangePercent == null || !isFinite(variacao) ? null : variacao
        };
    }

    async function buscarPosicao(simbolo) {

        if (typeof ResumoCarteiras === "undefined") {
            return null;
        }

        let carteiras;

        try {
            carteiras = await ResumoCarteiras.load();
        } catch (erro) {
            console.error("Erro ao carregar a posição:", erro);
            return null;
        }

        if (!Array.isArray(carteiras)) {
            return null;
        }

        let qtd = 0;
        let custo = 0;
        let saldo = 0;

        carteiras.forEach(carteira => {

            saldo += Number(carteira.saldo_livre_carteira) || 0;

            (carteira.ativos || []).forEach(ativo => {

                if (ativo.simbolo_ativo !== simbolo) {
                    return;
                }

                const q = Number(ativo.quantidade_item) || 0;

                qtd += q;
                custo += q * (Number(ativo.preco_medio_item) || 0);
            });
        });

        return { qtd, custo, pm: qtd > 0 ? custo / qtd : 0, saldo };
    }

    /* aceita as variações de formato do histórico da Brapi */
    function extrairSerie(json) {

        const resultado = json && json.results && json.results[0];

        if (!resultado) {
            return [];
        }

        const lista = resultado.historicalDataPrice ||
            (resultado.data && resultado.data.historicalDataPrice) ||
            resultado.prices ||
            resultado.history ||
            resultado.historical ||
            resultado.data ||
            [];

        if (!Array.isArray(lista)) {
            return [];
        }

        return lista
            .map(p => {
                const bruto = p.date ?? p.datetime ?? p.time;
                const t = typeof bruto === "number"
                    ? (bruto < 1e11 ? bruto * 1000 : bruto)
                    : Date.parse(bruto);

                return { t, v: Number(p.close ?? p.adjustedClose ?? p.price) };
            })
            .filter(p => isFinite(p.t) && isFinite(p.v))
            .sort((a, b) => a.t - b.t);
    }

    async function buscarHistorico(simbolo, range) {

        const chave = `${simbolo}|${range}`;

        if (cacheHistorico.has(chave)) {
            return cacheHistorico.get(chave);
        }

        const tipo = (window.ASSET_ROTA || {})[simbolo];
        const rota = tipo === "cripto" ? "historico-criptomoedas" : (tipo === "futuros" ? "historico-futuros" : (tipo === "moedas" ? "historico-moedas" : "historico-acoes"));

        const resp = await fetch(
            `${API}/brapi/${rota}?symbol=${encodeURIComponent(simbolo)}&range=${range}`
        );

        if (!resp.ok) {
            throw new Error(`HTTP ${resp.status}`);
        }

        const serie = extrairSerie(await resp.json());

        if (serie.length < 2) {
            throw new Error("Sem dados no período");
        }

        cacheHistorico.set(chave, serie);

        return serie;
    }


    /* =========================
       GRÁFICO
    ========================= */

    const L = 320;
    const A = 130;
    const P = 6;

    function montarGrafico(serie) {

        const valores = serie.map(p => p.v);
        const min = Math.min(...valores);
        const max = Math.max(...valores);
        const faixa = (max - min) || 1;

        const x = i => P + (L - 2 * P) * i / (serie.length - 1);
        const y = v => P + (A - 2 * P) * (1 - (v - min) / faixa);

        const pontos = serie.map((p, i) => `${x(i).toFixed(1)},${y(p.v).toFixed(1)}`);
        const subiu = valores[valores.length - 1] >= valores[0];
        const id = `adg${Math.random().toString(36).slice(2, 8)}`;

        const svg = `
            <svg class="ad-svg ${subiu ? "up" : "down"}" viewBox="0 0 ${L} ${A}" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
                        <stop class="ad-stop" offset="0%" stop-opacity=".35"></stop>
                        <stop class="ad-stop" offset="100%" stop-opacity="0"></stop>
                    </linearGradient>
                </defs>
                <polygon points="${P},${A} ${pontos.join(" ")} ${L - P},${A}" fill="url(#${id})"></polygon>
                <polyline class="ad-curva" points="${pontos.join(" ")}" vector-effect="non-scaling-stroke"></polyline>
            </svg>
            <div class="ad-cursor"></div>
            <div class="ad-ponto"></div>
            <div class="ad-bolha"></div>
        `;

        return { svg, subiu, min, max, x, y };
    }


    /* =========================
       TELA
    ========================= */

    let sessao = 0;

    function desenhar(raiz, item, cb) {

        const minhaSessao = ++sessao;
        const titulo = item.extra ? true : false;       /* renda fixa / tesouro */
        const mkt = titulo ? null : mercado(item);

        const estado = {
            preco: item.preco != null ? Number(item.preco) : null,
            variacao: item.variacao != null ? Number(item.variacao) : null,
            atualizadoEm: null,
            periodo: PERIODO_PADRAO,
            pos: null
        };

        let pedidoGrafico = 0;

        const periodos = PERIODOS.map((p, i) => `
            <button type="button" data-per="${i}" class="${i === estado.periodo ? "active" : ""}">${p.rotulo}</button>
        `).join("");

        const extra = item.extra || {};

        raiz.innerHTML = `
            <div class="ad">

                <div class="pp-head">
                    <button type="button" class="pp-back" data-voltar aria-label="Voltar"><i class="bi bi-chevron-left"></i></button>
                    <h3>Detalhes do ativo</h3>
                    <button type="button" class="ad-fav ${cb.ehFavorito() ? "on" : ""}" data-fav aria-label="Favoritar">
                        <i class="bi ${cb.ehFavorito() ? "bi-heart-fill" : "bi-heart"}"></i>
                    </button>
                </div>

                <div class="ad-hero">
                    <div class="ad-hero-top">
                        <span class="ad-badge">${esc(item.sigla || "AT")}</span>
                        <div class="ad-hero-info">
                            <strong>${esc(item.name)}</strong>
                            <small>${esc(item.sub || item.cls)}</small>
                        </div>
                        ${mkt ? `<span class="ad-status ${mkt.aberto ? "aberto" : ""}">● ${mkt.texto}</span>` : ""}
                    </div>
                    <div class="ad-hero-bottom">
                        <small>${titulo ? "RENTABILIDADE" : "PREÇO ATUAL"}</small>
                        ${titulo ? "" : `<span class="ad-chip" data-ad="variacao"></span>`}
                        <strong data-ad="preco">${titulo ? esc(extra.rent || "—") : "—"}</strong>
                    </div>
                </div>

                ${titulo ? "" : `
                    <div class="ad-atualiza">
                        <span data-ad="hora">Buscando cotação...</span> ·
                        <button type="button" data-atualizar><i class="bi bi-arrow-repeat"></i>Atualizar</button>
                    </div>
                `}

                <h4 class="ad-titulo">Minha posição</h4>
                <div class="ad-card">
                    <div class="ad-linha"><span>Preço médio</span><strong class="azul" data-ad="pm">—</strong></div>
                    <div class="ad-linha"><span>Quantidade</span><strong data-ad="qtd">—</strong></div>
                    <div class="ad-linha"><span>Posição</span><strong data-ad="posicao">—</strong></div>
                    <div class="ad-linha">
                        <span>Rentabilidade</span>
                        <span class="ad-dir"><span class="ad-chip" data-ad="rentPct"></span><strong data-ad="rentVal">—</strong></span>
                    </div>
                </div>

                ${titulo ? `
                    <h4 class="ad-titulo">Sobre o título</h4>
                    <div class="ad-card">
                        <div class="ad-linha"><span>Tipo</span><strong>${esc(extra.tipo || "—")}</strong></div>
                        <div class="ad-linha"><span>Resgate</span><strong>${esc(extra.resgate || "—")}</strong></div>
                        ${extra.minimo != null ? `<div class="ad-linha"><span>Aplicação mínima</span><strong>${esc(reais(extra.minimo))}</strong></div>` : ""}
                        ${(extra.tags || []).length ? `<div class="ad-tags">${extra.tags.map(t => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
                    </div>
                ` : `
                    <div class="ad-stats-head">
                        <h4 class="ad-titulo">Estatísticas de ${esc(item.name)}</h4>
                        <div class="ad-periodos">${periodos}</div>
                    </div>
                    <div class="ad-grafico" data-ad="grafico"><div class="ad-vazio">Carregando gráfico...</div></div>
                    <div class="ad-resumo" data-ad="resumo"></div>
                `}

                <div class="ad-rodape">
                    <div class="ad-saldo"><span>Saldo para investir</span><strong data-ad="saldo">—</strong></div>
                    <div class="ad-botoes">
                        <button type="button" class="ad-vender" data-acao="Venda">Vender</button>
                        <button type="button" class="ad-comprar" data-acao="Compra">Comprar</button>
                    </div>
                </div>

            </div>
        `;

        const ad = raiz.querySelector(".ad");
        const el = nome => ad.querySelector(`[data-ad="${nome}"]`);
        const vivo = () => minhaSessao === sessao;


        /* ---------- preenchimento ---------- */

        function pintarCartao() {

            if (titulo) {
                return;
            }

            el("preco").textContent = estado.preco != null ? reais(estado.preco) : "—";

            const chip = el("variacao");

            if (estado.variacao != null) {
                chip.textContent = `${seta(estado.variacao)} ${porcento(estado.variacao)}`;
                chip.className = `ad-chip ${estado.variacao >= 0 ? "up" : "down"}`;
            } else {
                chip.textContent = "";
            }

            el("hora").textContent = estado.atualizadoEm
                ? `Última atualização: ${hora(estado.atualizadoEm)}`
                : "Cotação indisponível";
        }

        function pintarPosicao() {

            const pos = estado.pos;

            if (!pos) {
                return;
            }

            el("saldo").textContent = reais(pos.saldo);

            const vender = ad.querySelector(".ad-vender");

            if (pos.qtd <= 0) {

                el("pm").textContent = "—";
                el("qtd").textContent = "0";
                el("posicao").textContent = reais(0);
                el("rentVal").textContent = "—";
                el("rentPct").textContent = "";

                vender.disabled = true;
                vender.title = "Você ainda não possui este ativo";

                return;
            }

            vender.disabled = false;
            vender.title = "";

            /* sem cotação (renda fixa, API fora do ar): vale o que foi investido */
            const valor = estado.preco != null && !titulo ? pos.qtd * estado.preco : pos.custo;
            const diferenca = valor - pos.custo;
            const percentual = pos.custo > 0 ? (diferenca / pos.custo) * 100 : 0;

            el("pm").textContent = reais(pos.pm);
            el("qtd").textContent = quantidade(pos.qtd);
            el("posicao").textContent = reais(valor);
            el("rentVal").textContent = reais(diferenca);

            const chip = el("rentPct");

            chip.textContent = `${seta(percentual)} ${porcento(percentual)}`;
            chip.className = `ad-chip ${percentual >= 0 ? "up" : "down"}`;
        }

        function pintarGrafico(serie) {

            const alvo = el("grafico");
            const resumo = el("resumo");

            const g = montarGrafico(serie);

            alvo.innerHTML = g.svg;

            const primeiro = serie[0].v;
            const ultimo = serie[serie.length - 1].v;
            const variacao = primeiro ? (ultimo / primeiro - 1) * 100 : 0;

            resumo.innerHTML = `
                <div><small>No período</small><strong class="${variacao >= 0 ? "up" : "down"}">${seta(variacao)} ${porcento(variacao)}</strong></div>
                <div><small>Mínima</small><strong>${esc(reais(g.min))}</strong></div>
                <div><small>Máxima</small><strong>${esc(reais(g.max))}</strong></div>
            `;

            /* sem variação do dia na cotação: usa os dois últimos fechamentos */
            if (estado.variacao == null && serie.length >= 2) {

                const anterior = serie[serie.length - 2].v;

                if (anterior) {
                    estado.variacao = (serie[serie.length - 1].v / anterior - 1) * 100;
                    pintarCartao();
                }
            }

            /* leitura ao passar o mouse / tocar no gráfico */
            const cursor = alvo.querySelector(".ad-cursor");
            const ponto = alvo.querySelector(".ad-ponto");
            const bolha = alvo.querySelector(".ad-bolha");

            alvo.style.setProperty("--ponto-cor", g.subiu ? "var(--verde)" : "var(--vermelho)");

            function ler(e) {

                const caixa = alvo.getBoundingClientRect();
                const fracao = Math.min(Math.max((e.clientX - caixa.left) / caixa.width, 0), 1);
                const i = Math.round(fracao * (serie.length - 1));
                const p = serie[i];
                const esquerda = (g.x(i) / L) * 100;

                cursor.style.left = `${esquerda}%`;
                ponto.style.left = `${esquerda}%`;
                ponto.style.top = `${(g.y(p.v) / A) * 100}%`;

                bolha.innerHTML = `${esc(reais(p.v))}<small>${new Date(p.t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</small>`;
                bolha.style.left = `${Math.min(Math.max(esquerda, 18), 82)}%`;

                alvo.classList.add("ativo");
            }

            alvo.addEventListener("pointermove", ler);
            alvo.addEventListener("pointerdown", ler);
            alvo.addEventListener("pointerleave", () => alvo.classList.remove("ativo"));
        }


        /* ---------- carregamentos ---------- */

        async function carregarCotacao() {

            if (titulo) {
                return;
            }

            const botao = ad.querySelector("[data-atualizar]");

            botao.classList.add("girando");
            botao.disabled = true;

            try {

                const c = await buscarCotacao(item.value);

                if (!vivo()) {
                    return;
                }

                estado.preco = c.preco;

                if (c.variacao != null) {
                    estado.variacao = c.variacao;
                }

                estado.atualizadoEm = new Date();

            } catch (erro) {

                console.error("Erro ao buscar a cotação:", erro);

                /* cai para o preço já conhecido (lista / cotação em cache) */
                if (estado.preco == null && typeof quotes !== "undefined" && quotes[item.value] != null) {
                    estado.preco = Number(quotes[item.value]);
                    estado.atualizadoEm = new Date();
                }

            } finally {

                if (vivo()) {
                    botao.classList.remove("girando");
                    botao.disabled = false;
                    pintarCartao();
                    pintarPosicao();
                }
            }
        }

        async function carregarPosicao() {

            const pos = await buscarPosicao(item.value);

            if (!vivo() || !pos) {
                return;
            }

            estado.pos = pos;
            pintarPosicao();
        }

        async function carregarGrafico() {

            if (titulo) {
                return;
            }

            const meu = ++pedidoGrafico;
            const alvo = el("grafico");

            alvo.innerHTML = `<div class="ad-vazio">Carregando gráfico...</div>`;
            el("resumo").innerHTML = "";

            try {

                const serie = await buscarHistorico(item.value, PERIODOS[estado.periodo].range);

                if (!vivo() || meu !== pedidoGrafico) {
                    return;
                }

                pintarGrafico(serie);

            } catch (erro) {

                console.error("Erro ao buscar o histórico:", erro);

                if (!vivo() || meu !== pedidoGrafico) {
                    return;
                }

                alvo.innerHTML = `<div class="ad-vazio">Histórico de preços indisponível para este ativo.</div>`;
            }
        }


        /* ---------- eventos ---------- */

        ad.querySelector("[data-fav]").addEventListener("click", e => {

            cb.alternarFavorito();

            const botao = e.currentTarget;
            const ligado = cb.ehFavorito();

            botao.classList.toggle("on", ligado);
            botao.querySelector("i").className = `bi ${ligado ? "bi-heart-fill" : "bi-heart"}`;

            botao.classList.remove("pop");
            void botao.offsetWidth;

            if (ligado) {
                botao.classList.add("pop");
            }
        });

        ad.querySelectorAll("[data-acao]").forEach(botao => {
            botao.addEventListener("click", () => cb.aoAcao(botao.dataset.acao));
        });

        const atualizar = ad.querySelector("[data-atualizar]");

        if (atualizar) {
            atualizar.addEventListener("click", () => {
                carregarCotacao();
                carregarPosicao();
            });
        }

        ad.querySelectorAll("[data-per]").forEach(botao => {
            botao.addEventListener("click", () => {

                estado.periodo = Number(botao.dataset.per);

                ad.querySelectorAll("[data-per]").forEach(b => b.classList.toggle("active", b === botao));

                carregarGrafico();
            });
        });


        /* ---------- início ---------- */

        if (estado.preco != null) {
            estado.atualizadoEm = new Date();
        }

        pintarCartao();

        carregarCotacao();
        carregarPosicao();
        carregarGrafico();
    }

    return { desenhar };

})();