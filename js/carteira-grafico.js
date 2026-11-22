/* =========================================================
   CARTEIRA - GRÁFICO DO APORTE

   Ao clicar no card de um ativo abre uma janela com a evolução
   do SEU aporte naquele ativo em 1 semana, 1 mês ou 1 ano:

     - linha cheia ....... valor da posição no dia
                           (quantidade que você tinha x preço de fechamento)
     - linha tracejada ... quanto você investiu até o dia
     - pontos ............ dias em que você comprou / vendeu

   Dados (nada de novo na API):
     - aportes ... GET /aportes/historico-aportes   (os removidos são ignorados)
     - preços .... GET /brapi/historico-acoes?symbol=PETR4&range=7d|1mo|1y

   Uso (feito pelo carteira-aportes.js):
     CarteiraGrafico.abrir({
         symbol, name, category, iniciais, tone,
         carteiraIds   // null = todas as carteiras, ou ["3"] para uma só
     })
========================================================= */

const CarteiraGrafico = (function () {

    "use strict";

    const API = (typeof API_BASE_URL !== "undefined")
        ? API_BASE_URL
        : "https://accuracyappapi.onrender.com";

    const PERIODOS = [
        { range: "7d",  rotulo: "1 semana" },
        { range: "1mo", rotulo: "1 mês" },
        { range: "1y",  rotulo: "1 ano" }
    ];

    const PERIODO_PADRAO = "1mo";

    const cachePrecos = new Map();   // "PETR4|7d" -> [{ t, v }]
    let cacheAportes = null;         // aportes ativos do usuário (busca 1 vez)

    let dialogo = null;
    let estado = {};
    let versaoPedido = 0;            // descarta resposta de pedido antigo
    let ultimoDesenho = null;        // para redesenhar ao girar a tela


    /* =========================
       FORMATAÇÃO
    ========================= */

    function esc(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function dinheiro(valor, casas = 2) {
        return (Number(valor) || 0).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: casas,
            maximumFractionDigits: casas
        });
    }

    function comSinal(valor) {
        return (valor > 0 ? "+" : "") + dinheiro(valor);
    }

    function porcento(valor) {
        const n = Number(valor) || 0;

        return (n > 0 ? "+" : "") + n.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + "%";
    }

    // "2026-11-09" -> "09/11" ou "09/11/26"
    function dataCurta(dia, comAno) {
        const [a, m, d] = dia.split("-");

        return comAno ? `${d}/${m}/${a.slice(2)}` : `${d}/${m}`;
    }

    function dataCompleta(dia) {
        const [a, m, d] = dia.split("-");

        return `${d}/${m}/${a}`;
    }

    function tendencia(valor) {
        if (Math.abs(valor) < 0.005) return "flat";

        return valor > 0 ? "up" : "down";
    }


    /* =========================
       DADOS
    ========================= */

    async function buscarAportes() {

        if (cacheAportes) {
            return cacheAportes;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Sua sessão expirou. Entre novamente.");
        }

        const resposta = await fetch(`${API}/aportes/historico-aportes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const dados = await resposta.json();

        if (!resposta.ok || dados.sucesso !== true) {
            throw new Error(dados.mensagem || `HTTP ${resposta.status}`);
        }

        // o histórico também devolve os removidos: aqui eles não contam
        cacheAportes = (dados.aportes || []).filter(a => !a.removido_em);

        return cacheAportes;
    }

    // aceita as variações de formato do histórico da Brapi
    function extrairSerie(json) {

        const resultado = json && json.results && json.results[0];

        if (!resultado) {
            return [];
        }

        const lista = resultado.historicalDataPrice ||
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

    async function buscarPrecos(simbolo, range) {

        const chave = `${simbolo}|${range}`;

        if (cachePrecos.has(chave)) {
            return cachePrecos.get(chave);
        }

        const resposta = await fetch(
            `${API}/brapi/historico-acoes?symbol=${encodeURIComponent(simbolo)}&range=${range}`
        );

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const serie = extrairSerie(await resposta.json());

        cachePrecos.set(chave, serie);

        return serie;
    }

    // compras e vendas deste ativo, na ordem em que aconteceram
    function eventosDoAtivo(aportes, simbolo, carteiraIds) {

        return aportes
            .filter(a =>
                a.ativo_aporte === simbolo &&
                (!carteiraIds || carteiraIds.includes(String(a.id_carteira)))
            )
            .map(a => ({
                id: Number(a.id_aporte) || 0,
                dia: String(a.data_aporte || "").slice(0, 10),
                tipo: a.tipo_aporte,
                qtd: Number(a.quantidade_aporte) || 0,
                valor: Number(a.valor_aporte) || 0
            }))
            // dividendo não muda a quantidade
            .filter(e => e.dia && (e.tipo === "Compra" || e.tipo === "Venda"))
            .sort((a, b) => a.dia.localeCompare(b.dia) || a.id - b.id);
    }

    /*
       Para cada dia de pregão do período calcula quanto você tinha:
         qtd    -> compras - vendas feitas até o dia
         custo  -> quanto pagou (a venda tira o custo pelo preço médio)
         valor  -> qtd x preço de fechamento do dia
       Dias antes do primeiro aporte (qtd = 0) ficam de fora.
    */
    function montarSerie(precos, eventos) {

        const pontos = [];
        let i = 0;
        let qtd = 0;
        let custo = 0;

        for (const p of precos) {

            const dia = new Date(p.t).toISOString().slice(0, 10);

            while (i < eventos.length && eventos[i].dia <= dia) {

                const e = eventos[i++];

                if (e.tipo === "Compra") {
                    qtd += e.qtd;
                    custo += e.valor;
                } else {
                    const vendida = Math.min(e.qtd, qtd);

                    if (qtd > 0) {
                        custo -= custo * (vendida / qtd);
                    }

                    qtd -= vendida;
                }
            }

            if (qtd > 0) {
                pontos.push({ t: p.t, dia, preco: p.v, qtd, custo, valor: qtd * p.v });
            }
        }

        return pontos;
    }

    // dias em que houve compra/venda dentro do que está desenhado
    function montarMarcas(pontos, eventos) {

        const primeiro = pontos[0].dia;
        const ultimo = pontos[pontos.length - 1].dia;
        const marcas = [];

        for (const e of eventos) {

            if (e.dia < primeiro || e.dia > ultimo) continue;

            const indice = pontos.findIndex(p => p.dia >= e.dia);

            if (indice >= 0) {
                marcas.push({ indice, tipo: e.tipo, qtd: e.qtd, dia: e.dia });
            }
        }

        return marcas;
    }


    /* =========================
       GRÁFICO (SVG)
    ========================= */

    function desenharSvg(pontos, marcas, largura, ehAno) {

        const W = Math.max(300, Math.round(largura));
        const H = W < 480 ? 220 : 270;
        const M = { t: 14, r: 14, b: 28, l: 66 };
        const n = pontos.length;

        const todos = pontos.flatMap(p => [p.valor, p.custo]);
        let min = Math.min(...todos);
        let max = Math.max(...todos);

        if (max - min < 1e-9) {
            min = max * 0.99;
            max = max * 1.01 || 1;
        }

        const folga = (max - min) * 0.12;

        min = Math.max(0, min - folga);
        max += folga;

        const x = i => M.l + (n === 1 ? 0 : i * (W - M.l - M.r) / (n - 1));
        const y = v => M.t + (max - v) * (H - M.t - M.b) / (max - min);
        const f = v => v.toFixed(1);

        const casas = (max - min) < 20 ? 2 : 0;

        // grade horizontal com 4 valores
        let grade = "";

        for (let k = 0; k < 4; k++) {

            const v = min + (k * (max - min)) / 3;

            grade += `
                <line class="cg-grade" x1="${M.l}" x2="${W - M.r}" y1="${f(y(v))}" y2="${f(y(v))}"/>
                <text x="${M.l - 8}" y="${f(y(v) + 4)}" text-anchor="end">${dinheiro(v, casas)}</text>`;
        }

        // datas no eixo X: início, meio e fim
        const idxDatas = n > 2 ? [0, Math.round((n - 1) / 2), n - 1] : [0, n - 1];

        const datas = idxDatas.map((i, pos) => {
            const ancora = pos === 0 ? "start" : (pos === idxDatas.length - 1 ? "end" : "middle");

            return `<text x="${f(x(i))}" y="${H - 8}" text-anchor="${ancora}">${dataCurta(pontos[i].dia, ehAno)}</text>`;
        }).join("");

        // linha do valor + área abaixo dela
        const linha = pontos
            .map((p, i) => `${i ? "L" : "M"}${f(x(i))},${f(y(p.valor))}`)
            .join(" ");

        const area = `${linha} L${f(x(n - 1))},${H - M.b} L${f(x(0))},${H - M.b} Z`;

        // linha do investido em degraus (só muda quando há compra/venda)
        const degraus = pontos
            .map((p, i) => i
                ? `H${f(x(i))} V${f(y(p.custo))}`
                : `M${f(x(i))},${f(y(p.custo))}`)
            .join(" ");

        const pontosMarcas = marcas.map(m => `
            <circle class="cg-marca ${m.tipo === "Venda" ? "venda" : "compra"}"
                    cx="${f(x(m.indice))}" cy="${f(y(pontos[m.indice].valor))}" r="5">
                <title>${m.tipo} de ${m.qtd.toLocaleString("pt-BR", { maximumFractionDigits: 6 })} em ${dataCompleta(m.dia)}</title>
            </circle>`).join("");

        const ult = pontos[n - 1];
        const resumo = `Valor da posição de ${dinheiro(pontos[0].valor)} em ${dataCompleta(pontos[0].dia)} ` +
            `para ${dinheiro(ult.valor)} em ${dataCompleta(ult.dia)}`;

        const svg = `
            <svg class="cg-svg ${tendencia(ult.valor - ult.custo)}" viewBox="0 0 ${W} ${H}"
                 width="${W}" height="${H}" role="img" aria-label="${esc(resumo)}">

                <defs>
                    <linearGradient id="cgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stop-color="currentColor" stop-opacity=".28"/>
                        <stop offset="1" stop-color="currentColor" stop-opacity="0"/>
                    </linearGradient>
                </defs>

                ${grade}
                ${datas}

                <path d="${area}" fill="url(#cgGrad)"/>
                <path class="cg-custo" d="${degraus}"/>
                <path class="cg-valor" d="${linha}"/>
                ${pontosMarcas}

                <line class="cg-guia" id="cgGuia" y1="${M.t}" y2="${H - M.b}" visibility="hidden"/>
                <circle class="cg-ponto" id="cgPonto" r="4.5" visibility="hidden"/>
            </svg>`;

        return { svg, W, H, M, x, y };
    }

    function ligarInteracao(raiz, pontos, geo, ehAno) {

        const svg = raiz.querySelector("svg");
        const guia = raiz.querySelector("#cgGuia");
        const ponto = raiz.querySelector("#cgPonto");
        const dica = raiz.querySelector(".cg-dica");
        const n = pontos.length;

        function mostrar(evento) {

            const caixa = svg.getBoundingClientRect();
            const xView = (evento.clientX - caixa.left) * (geo.W / caixa.width);
            const passo = n > 1 ? (geo.W - geo.M.l - geo.M.r) / (n - 1) : 1;
            const i = Math.max(0, Math.min(n - 1, Math.round((xView - geo.M.l) / passo)));
            const p = pontos[i];
            const px = geo.x(i);

            guia.setAttribute("x1", px);
            guia.setAttribute("x2", px);
            ponto.setAttribute("cx", px);
            ponto.setAttribute("cy", geo.y(p.valor));
            guia.setAttribute("visibility", "visible");
            ponto.setAttribute("visibility", "visible");

            dica.innerHTML = `
                <b>${dataCompleta(p.dia)}</b>
                <span>Posição <strong>${dinheiro(p.valor)}</strong></span>
                <span>Investido <strong>${dinheiro(p.custo)}</strong></span>
                <span>Preço <strong>${dinheiro(p.preco)}</strong></span>`;

            dica.style.left = `${Math.max(80, Math.min(geo.W - 80, px))}px`;
            dica.hidden = false;
        }

        function esconder() {
            guia.setAttribute("visibility", "hidden");
            ponto.setAttribute("visibility", "hidden");
            dica.hidden = true;
        }

        svg.addEventListener("pointermove", mostrar);
        svg.addEventListener("pointerdown", mostrar);
        svg.addEventListener("pointerleave", esconder);
    }


    /* =========================
       JANELA
    ========================= */

    function montarJanela() {

        if (dialogo) {
            return;
        }

        dialogo = document.createElement("dialog");
        dialogo.className = "cg-dialogo";
        dialogo.setAttribute("aria-labelledby", "cgTitulo");

        dialogo.innerHTML = `
            <div class="cg-caixa">

                <div class="cg-topo">
                    <div class="cg-icone" id="cgIcone"></div>

                    <div class="cg-titulo">
                        <strong id="cgTitulo"></strong>
                        <small id="cgSub"></small>
                    </div>

                    <button type="button" class="cg-fechar" aria-label="Fechar gráfico">
                        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                            <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor"
                                  stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>
                </div>

                <div class="view-toggle cg-periodos" role="group" aria-label="Período do gráfico">
                    ${PERIODOS.map(p =>
                        `<button type="button" data-range="${p.range}">${p.rotulo}</button>`
                    ).join("")}
                </div>

                <div class="cg-stats" id="cgStats"></div>

                <div class="cg-corpo" id="cgCorpo" aria-live="polite"></div>

                <p class="cg-nota" id="cgNota"></p>

            </div>`;

        document.body.appendChild(dialogo);

        // fechar: botão X, clique fora (no fundo escuro) ou Esc (nativo)
        dialogo.querySelector(".cg-fechar").addEventListener("click", () => dialogo.close());

        dialogo.addEventListener("click", evento => {
            if (evento.target === dialogo) {
                dialogo.close();
            }
        });

        dialogo.addEventListener("close", () => {
            versaoPedido++;
            document.body.style.overflow = "";
        });

        dialogo.querySelector(".cg-periodos").addEventListener("click", evento => {

            const botao = evento.target.closest("[data-range]");

            if (!botao || botao.dataset.range === estado.range) return;

            estado.range = botao.dataset.range;
            marcarPeriodo();
            carregar();
        });

        // refaz o desenho se a largura mudar (girar o celular, redimensionar)
        let espera;

        window.addEventListener("resize", () => {

            clearTimeout(espera);

            espera = setTimeout(() => {
                if (dialogo.open && ultimoDesenho) {
                    desenharGrafico(ultimoDesenho);
                }
            }, 150);
        });
    }

    function marcarPeriodo() {

        dialogo.querySelectorAll(".cg-periodos [data-range]").forEach(botao => {
            botao.classList.toggle("active", botao.dataset.range === estado.range);
        });
    }

    function mensagem(texto, detalhe) {

        dialogo.querySelector("#cgStats").innerHTML = "";
        dialogo.querySelector("#cgNota").textContent = "";

        dialogo.querySelector("#cgCorpo").innerHTML = `
            <div class="cg-msg">
                ${esc(texto)}
                ${detalhe ? `<small>${esc(detalhe)}</small>` : ""}
            </div>`;
    }

    function desenharGrafico({ pontos, marcas, range }) {

        ultimoDesenho = { pontos, marcas, range };

        const corpo = dialogo.querySelector("#cgCorpo");
        const ehAno = range === "1y";

        const primeiro = pontos[0];
        const ultimo = pontos[pontos.length - 1];

        const resultado = ultimo.valor - ultimo.custo;
        const resultadoPct = ultimo.custo > 0 ? (resultado / ultimo.custo) * 100 : 0;
        const variacaoAtivo = primeiro.preco > 0
            ? (ultimo.preco / primeiro.preco - 1) * 100
            : 0;

        dialogo.querySelector("#cgStats").innerHTML = `
            <div class="cg-stat">
                <span>Valor da posição</span>
                <strong>${dinheiro(ultimo.valor)}</strong>
            </div>

            <div class="cg-stat">
                <span>Resultado</span>
                <strong class="${tendencia(resultado)}">
                    ${comSinal(resultado)} <small>(${porcento(resultadoPct)})</small>
                </strong>
            </div>

            <div class="cg-stat">
                <span>Variação do ativo</span>
                <strong class="${tendencia(variacaoAtivo)}">${porcento(variacaoAtivo)}</strong>
            </div>`;

        const temCompra = marcas.some(m => m.tipo === "Compra");
        const temVenda = marcas.some(m => m.tipo === "Venda");

        corpo.innerHTML = `
            <div class="cg-grafico">
                <div class="cg-dica" hidden></div>
            </div>

            <div class="cg-legenda ${tendencia(resultado)}">
                <span class="l-valor">Valor da posição</span>
                <span class="l-custo">Investido</span>
                ${temCompra ? `<span class="l-compra">Compra</span>` : ""}
                ${temVenda ? `<span class="l-venda">Venda</span>` : ""}
            </div>`;

        const area = corpo.querySelector(".cg-grafico");
        const geo = desenharSvg(pontos, marcas, area.clientWidth || corpo.clientWidth || 600, ehAno);

        area.insertAdjacentHTML("afterbegin", geo.svg);
        ligarInteracao(area, pontos, geo, ehAno);

        const inicioReal = primeiro.dia;
        const rotulo = PERIODOS.find(p => p.range === range).rotulo.toLowerCase();

        dialogo.querySelector("#cgNota").textContent =
            `De ${dataCompleta(inicioReal)} a ${dataCompleta(ultimo.dia)} (${rotulo}), ` +
            `com base no preço de fechamento. Só aparecem os dias a partir do seu primeiro aporte.`;
    }

    async function carregar() {

        const pedido = ++versaoPedido;
        const { symbol, carteiraIds, range, category } = estado;

        ultimoDesenho = null;
        dialogo.querySelector("#cgStats").innerHTML = "";
        dialogo.querySelector("#cgNota").textContent = "";
        // Renda Fixa não tem cotação diária: nem adianta consultar a Brapi
        if (category === "Renda Fixa") {
            mensagem(
                `${symbol} é de Renda Fixa e não tem histórico de preço diário.`,
                "O gráfico está disponível para ativos negociados em bolsa, como ações e FIIs."
            );
            return;
        }

        dialogo.querySelector("#cgCorpo").innerHTML =
            `<div class="cg-msg">Carregando gráfico…</div>`;

        try {

            const [aportes, precos] = await Promise.all([
                buscarAportes(),
                buscarPrecos(symbol, range)
            ]);

            if (pedido !== versaoPedido) return;

            const eventos = eventosDoAtivo(aportes, symbol, carteiraIds);

            if (!eventos.length) {
                mensagem(`Não encontrei aportes ativos de ${symbol} nesta carteira.`);
                return;
            }

            if (precos.length < 2) {
                mensagem(
                    `Sem histórico de cotações de ${symbol} para este período.`,
                    "Ativos como Renda Fixa e alguns tipos de cripto não têm histórico de preço."
                );
                return;
            }

            const pontos = montarSerie(precos, eventos);

            if (pontos.length < 2) {
                mensagem(
                    "Seu aporte é muito recente para este período.",
                    "O gráfico aparece a partir do segundo dia de cotação depois do aporte."
                );
                return;
            }

            desenharGrafico({
                pontos,
                marcas: montarMarcas(pontos, eventos),
                range
            });

        } catch (erro) {

            if (pedido !== versaoPedido) return;

            console.error("carteira-grafico:", erro);

            const sessao = /sess[aã]o|login/i.test(erro.message);

            mensagem(
                sessao
                    ? erro.message
                    : `Não foi possível carregar o histórico de ${symbol} neste período.`,
                sessao ? "" : "Tente outro período. Ativos sem histórico de preço (como cripto) não têm gráfico."
            );
        }
    }

    function abrir(opcoes) {

        montarJanela();

        estado = {
            symbol: opcoes.symbol,
            category: opcoes.category || "",
            carteiraIds: opcoes.carteiraIds || null,
            range: PERIODO_PADRAO
        };

        const icone = dialogo.querySelector("#cgIcone");

        icone.textContent = opcoes.iniciais || String(opcoes.symbol).slice(0, 2);
        icone.style.setProperty("--tone", opcoes.tone || "var(--primaria)");

        dialogo.querySelector("#cgTitulo").textContent = opcoes.symbol;
        dialogo.querySelector("#cgSub").textContent =
            [opcoes.category, opcoes.name].filter(Boolean).join(" · ");

        marcarPeriodo();

        document.body.style.overflow = "hidden";

        if (typeof dialogo.showModal === "function") {
            dialogo.showModal();
        } else {
            dialogo.setAttribute("open", "");
        }

        carregar();
    }

    return { abrir };

})();