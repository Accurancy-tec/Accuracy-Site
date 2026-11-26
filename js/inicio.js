/* =========================================================
   INÍCIO (dashboard)

   Resumo do patrimônio, notícias, gráfico de evolução,
   distribuição e carteiras. Todos os números vêm da API:
   /carteiras/resumo, /noticias/listar e /vico/evolucao-carteira.
========================================================= */
(function () {
    "use strict";

    const { brl, pct } = window.V2Fmt;
    const $ = id => document.getElementById(id);

    const NOMES_CATEGORIA = {
        "Ações": "Ações",
        "FIIs": "Fundos imobiliários",
        "Renda Fixa": "Renda fixa",
        "Cripto": "Criptomoedas",
        "Internacional": "Internacional e moedas",
        "Futuros": "Contratos futuros"
    };

    const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function token() {
        return localStorage.getItem("token");
    }

    async function api(caminho, autenticado = true) {
        const resposta = await fetch(`${window.ACCURACY_API_URL}${caminho}`, {
            headers: autenticado ? { Authorization: `Bearer ${token()}` } : {}
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || (dados.success !== true && dados.sucesso !== true)) {
            throw new Error(dados.message || dados.mensagem || `HTTP ${resposta.status}`);
        }

        return dados;
    }

    function texto(el, valor) {
        el.textContent = valor;
        el.classList.remove("carregando-texto");
    }

    function classeSinal(valor) {
        if (!Number.isFinite(valor) || Math.abs(valor) < 0.005) return "neutro";
        return valor > 0 ? "positivo" : "negativo";
    }

    /* O valor principal "conta" até o número real quando chega (sem atrasar a leitura). */
    function animarValor(el, valor) {
        el.classList.remove("carregando-texto");

        if (reduzirMovimento || !Number.isFinite(valor) || valor === 0) {
            el.textContent = brl(valor);
            return;
        }

        const inicio = performance.now();
        const duracao = 650;

        function passo(agora) {
            const t = Math.min(1, (agora - inicio) / duracao);
            const suave = 1 - Math.pow(1 - t, 3);
            el.textContent = brl(valor * suave);
            if (t < 1) requestAnimationFrame(passo);
        }

        requestAnimationFrame(passo);
    }


    /* =========================
       CABEÇALHO
    ========================= */

    const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    $("inicioData").textContent = hoje.charAt(0).toUpperCase() + hoje.slice(1);


    /* =========================
       RESUMO, DISTRIBUIÇÃO E CARTEIRAS
    ========================= */

    let resumoDesenhado = false;

    function desenharResumo(dados) {
        const resumo = dados.resumo;
        if (!resumo) return;

        const real = resumo.real;
        const simulado = resumo.simulado;

        animarValor($("inicioPatrimonio"), real.patrimonio_total);
        texto($("inicioSaldo"), brl(resumo.saldo_geral));
        texto($("inicioInvestido"), brl(real.total_investido));
        texto($("inicioMercado"), brl(real.valor_mercado));

        const resultado = $("inicioResultado");
        texto(resultado, `${real.lucro_prejuizo > 0 ? "+" : ""}${brl(real.lucro_prejuizo)}`);
        resultado.className = classeSinal(real.lucro_prejuizo);

        const variacao = $("inicioVariacao");
        variacao.hidden = !(real.total_investido > 0);
        variacao.textContent = `${pct(real.rentabilidade_percentual, 2)} nos ativos`;
        variacao.className = `inicio-variacao ${classeSinal(real.rentabilidade_percentual)}`;

        const simulacoes = $("inicioSimulacoes");
        simulacoes.hidden = simulado.quantidade_carteiras === 0;
        simulacoes.innerHTML = "";
        if (simulado.quantidade_carteiras > 0) {
            const forte = document.createElement("strong");
            forte.textContent = brl(simulado.patrimonio_total);
            const sinal = document.createElement("span");
            sinal.className = classeSinal(simulado.resultado);
            sinal.textContent = ` (${pct(simulado.rentabilidade_percentual, 2)})`;
            simulacoes.append(
                `Simulações (${simulado.quantidade_carteiras}): `,
                forte,
                sinal,
                " · não entram no patrimônio"
            );
        }

        document.querySelector(".inicio-patrimonio").setAttribute("aria-busy", "false");

        desenharDistribuicao(resumo.distribuicao);
        desenharCarteiras(dados.carteiras);

        if (!resumoDesenhado) {
            document.querySelector(".inicio-topo").classList.add("v2-entrar");
            resumoDesenhado = true;
        }
    }

    function desenharDistribuicao(distribuicao) {
        const alvo = $("inicioDistribuicao");
        alvo.setAttribute("aria-busy", "false");

        if (!distribuicao.length) {
            alvo.innerHTML = '<p class="inicio-vazio">Seus investimentos em carteiras reais aparecem aqui por tipo de ativo.</p>';
            return;
        }

        const lista = document.createElement("ul");
        lista.className = "inicio-barras";

        distribuicao.forEach((item, i) => {
            const li = document.createElement("li");
            li.style.setProperty("--atraso", `${i * 70}ms`);

            const nome = document.createElement("span");
            nome.textContent = NOMES_CATEGORIA[item.categoria] || item.categoria;

            const valor = document.createElement("strong");
            valor.textContent = `${brl(item.valor)} · ${item.percentual.toFixed(1).replace(".", ",")}%`;

            const trilho = document.createElement("span");
            trilho.className = "inicio-barra";
            const preenchida = document.createElement("i");
            preenchida.dataset.largura = `${item.percentual}%`;
            trilho.appendChild(preenchida);

            li.append(nome, valor, trilho);
            lista.appendChild(li);
        });

        alvo.replaceChildren(lista);

        // As barras crescem até o percentual depois de entrarem na tela
        requestAnimationFrame(() => requestAnimationFrame(() => {
            lista.querySelectorAll(".inicio-barra i").forEach(i => { i.style.width = i.dataset.largura; });
        }));
    }

    function desenharCarteiras(carteiras) {
        const alvo = $("inicioCarteiras");
        alvo.setAttribute("aria-busy", "false");

        if (!carteiras.length) {
            alvo.innerHTML = '<li class="inicio-vazio">Você ainda não tem carteiras. <a href="carteira.php?nova=1">Criar a primeira</a></li>';
            return;
        }

        alvo.replaceChildren(...carteiras.slice(0, 5).map(c => {
            const li = document.createElement("li");
            const link = document.createElement("a");
            link.href = `carteira.php?id=${encodeURIComponent(c.id_carteira)}`;

            const nome = document.createElement("span");
            nome.className = "inicio-carteira-nome";
            nome.textContent = c.nome_carteira;

            const tipo = document.createElement("small");
            tipo.className = `inicio-tag ${c.tipo_carteira === "Simulada" ? "simulada" : "real"}`;
            tipo.textContent = c.tipo_carteira;

            const valor = document.createElement("strong");
            valor.textContent = brl(c.valor);

            const rent = document.createElement("small");
            rent.className = classeSinal(c.rent);
            rent.textContent = c.rent === null ? "sem ativos" : pct(c.rent, 2);

            link.append(nome, tipo, valor, rent);
            li.appendChild(link);
            return li;
        }));
    }

    window.addEventListener("accuracy:resumo-atualizado", e => desenharResumo(e.detail));

    window.V2Dados.carregar().then(desenharResumo).catch(erro => {
        console.error("Resumo do patrimônio:", erro);
        ["inicioPatrimonio", "inicioSaldo", "inicioInvestido", "inicioMercado", "inicioResultado"].forEach(id => texto($(id), "—"));
        window.V2Toast("Não foi possível carregar o patrimônio agora.");
    });


    /* =========================
       NOTÍCIAS
    ========================= */

    const dialogo = $("noticiaDialogo");

    function quandoPublicada(iso) {
        const data = new Date(iso);
        if (Number.isNaN(data.getTime())) return "";
        const horas = (Date.now() - data.getTime()) / 3600000;
        if (horas < 1) return "há poucos minutos";
        if (horas < 24) return `há ${Math.round(horas)} h`;
        return data.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "");
    }

    function cartaoNoticia(noticia, i) {
        const cartao = document.createElement("article");
        cartao.className = "inicio-noticia";
        cartao.style.setProperty("--atraso", `${i * 60}ms`);

        const capa = document.createElement("div");
        capa.className = "inicio-noticia-capa";

        if (noticia.imagem) {
            const img = document.createElement("img");
            img.src = noticia.imagem;
            img.alt = "";
            img.loading = "lazy";
            img.referrerPolicy = "no-referrer";
            img.addEventListener("error", () => { img.remove(); capa.classList.add("sem-imagem"); });
            capa.appendChild(img);
        } else {
            capa.classList.add("sem-imagem");
        }

        const fonte = document.createElement("span");
        fonte.className = "inicio-noticia-fonte";
        fonte.textContent = [noticia.fonte, quandoPublicada(noticia.publicada_em)].filter(Boolean).join(" · ");
        capa.appendChild(fonte);

        const titulo = document.createElement("h3");
        titulo.textContent = noticia.titulo;

        const resumo = document.createElement("p");
        resumo.textContent = noticia.resumo || "";

        cartao.append(capa, titulo, resumo);

        if (noticia.url) {
            const link = document.createElement("a");
            link.className = "inicio-noticia-link";
            link.href = noticia.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = `Ler no ${noticia.fonte}`;
            link.setAttribute("aria-label", `${noticia.titulo} (abre o site ${noticia.fonte} em nova aba)`);
            cartao.appendChild(link);
        } else if (noticia.conteudo) {
            const abrir = document.createElement("button");
            abrir.type = "button";
            abrir.className = "inicio-noticia-link";
            abrir.textContent = "Ler notícia";
            abrir.addEventListener("click", () => {
                $("noticiaDialogoFonte").textContent = noticia.fonte;
                $("noticiaDialogoTitulo").textContent = noticia.titulo;
                const corpo = $("noticiaDialogoTexto");
                corpo.replaceChildren(...noticia.conteudo.split(/\n{2,}/).map(paragrafo => {
                    const p = document.createElement("p");
                    p.textContent = paragrafo;
                    return p;
                }));
                dialogo.showModal();
            });
            cartao.appendChild(abrir);
        }

        return cartao;
    }

    async function carregarNoticias() {
        const alvo = $("inicioNoticias");

        try {
            const dados = await api("/noticias/listar?limite=6", false);

            if (!dados.noticias.length) {
                alvo.innerHTML = '<p class="inicio-vazio">Nenhuma notícia disponível agora. Volte mais tarde.</p>';
            } else {
                alvo.replaceChildren(...dados.noticias.map(cartaoNoticia));
            }
        } catch (erro) {
            alvo.innerHTML = '<p class="inicio-vazio">Não foi possível carregar as notícias agora.</p>';
        } finally {
            alvo.setAttribute("aria-busy", "false");
        }
    }

    carregarNoticias();


    /* =========================
       GRÁFICO DE EVOLUÇÃO
    ========================= */

    const areaGrafico = $("inicioGrafico");
    const rodape = $("inicioGraficoRodape");
    const botoesPeriodo = document.querySelectorAll(".inicio-periodos button");
    let periodoAtual = "6M";

    function carregandoGrafico() {
        areaGrafico.setAttribute("aria-busy", "true");
        areaGrafico.innerHTML = '<div class="grafico-carregando"><span class="skeleton"></span><small>Montando o gráfico…</small></div>';
        rodape.hidden = true;
    }

    async function carregarGrafico(periodo) {
        periodoAtual = periodo;
        carregandoGrafico();

        try {
            const dados = await api(`/vico/evolucao-carteira?periodo=${encodeURIComponent(periodo)}`);
            if (periodo !== periodoAtual) return;

            const pontos = (dados.pontos || []).filter(p => Number.isFinite(Number(p.valor))).map(p => ({ data: p.data, valor: Number(p.valor) }));

            if (!pontos.some(p => p.valor > 0)) {
                areaGrafico.innerHTML = '<div class="inicio-vazio grafico-vazio"><i class="bi bi-graph-up" aria-hidden="true"></i><p>Ainda não há investimentos em carteiras reais neste período.</p><a class="v2-btn" href="aportes.php">Fazer um aporte</a></div>';
                return;
            }

            // Começa no primeiro dia com investimento, para a linha não ficar colada no zero
            const primeiro = pontos.findIndex(p => p.valor > 0);
            const visiveis = pontos.slice(Math.max(0, primeiro - 1));

            GraficoLinha.desenhar(areaGrafico, visiveis, { altura: 260, rotulo: "Evolução dos investimentos" });

            const inicio = visiveis[0].valor;
            const fim = visiveis[visiveis.length - 1].valor;
            $("graficoInicio").textContent = brl(inicio);
            $("graficoFim").textContent = brl(fim);
            const variacao = $("graficoVariacao");
            variacao.textContent = `${fim - inicio >= 0 ? "+" : ""}${brl(fim - inicio)}`;
            variacao.className = classeSinal(fim - inicio);
            rodape.hidden = false;
        } catch (erro) {
            if (periodo !== periodoAtual) return;
            areaGrafico.innerHTML = '<div class="inicio-vazio grafico-vazio"><p>Não foi possível carregar o gráfico.</p><button type="button" class="v2-btn-outline" id="graficoTentar">Tentar de novo</button></div>';
            $("graficoTentar").addEventListener("click", () => carregarGrafico(periodo));
        } finally {
            if (periodo === periodoAtual) areaGrafico.setAttribute("aria-busy", "false");
        }
    }

    botoesPeriodo.forEach(botao => botao.addEventListener("click", () => {
        if (botao.dataset.periodo === periodoAtual) return;
        botoesPeriodo.forEach(b => {
            const ativo = b === botao;
            b.classList.toggle("ativo", ativo);
            b.setAttribute("aria-selected", String(ativo));
        });
        carregarGrafico(botao.dataset.periodo);
    }));

    carregarGrafico(periodoAtual);
})();
