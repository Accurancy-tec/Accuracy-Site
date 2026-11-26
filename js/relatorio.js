/* =========================================================
   RELATÓRIO
   Números da conta, observações e análise opcional com IA.
   Rotas: GET relatorios/resumo?dias=N e POST relatorios/analise.
========================================================= */
(function () {
    "use strict";

    const API = window.ACCURACY_API_URL + "/relatorios/";
    const $ = id => document.getElementById(id);
    const fmt = window.V2Fmt;

    const ICONES = {
        positivo: "bi-arrow-up-right-circle",
        atencao: "bi-exclamation-circle",
        info: "bi-info-circle",
        inicio: "bi-stars"
    };

    let diasAtual = 30;
    let relogioIa = null;

    async function chamar(caminho, opcoes = {}) {
        const resposta = await fetch(API + caminho, {
            ...opcoes,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        const dados = await resposta.json().catch(() => ({}));
        return { ok: resposta.ok && dados.success === true, status: resposta.status, dados };
    }

    function elemento(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto != null) el.textContent = texto;
        return el;
    }

    function classeSinal(valor) {
        const n = Number(valor);
        return n > 0 ? "rel-positivo" : n < 0 ? "rel-negativo" : "";
    }

    function dataCurta(iso) {
        const [ano, mes, dia] = String(iso).split("-");
        return dia && mes && ano ? `${dia}/${mes}/${ano}` : "";
    }

    /* ---------- números do topo ---------- */

    function mostrarNumeros(r) {
        const real = r.real;
        const sim = r.simulado;

        $("relPatrimonio").textContent = fmt.brl(real.patrimonio_total);
        $("relPatrimonioDetalhe").textContent = `${fmt.brl(r.saldo_geral)} de saldo disponível`;

        $("relInvestido").textContent = fmt.brl(real.total_investido);
        $("relInvestidoDetalhe").textContent = `Valor atual: ${fmt.brl(real.valor_mercado)}`;

        const resultado = $("relResultado");
        resultado.textContent = fmt.brl(real.lucro_prejuizo);
        resultado.className = classeSinal(real.lucro_prejuizo);
        $("relResultadoDetalhe").textContent = real.total_investido > 0
            ? `${fmt.pct(real.rentabilidade_percentual, 2)} sobre o valor aplicado`
            : "Ainda sem ativos nas carteiras reais";

        $("relSimulado").textContent = sim.quantidade_carteiras > 0 ? fmt.brl(sim.patrimonio_total) : "—";
        $("relSimuladoDetalhe").textContent = sim.quantidade_carteiras > 0
            ? `${fmt.pct(sim.rentabilidade_percentual, 2)} · ${sim.quantidade_carteiras} ${sim.quantidade_carteiras === 1 ? "carteira" : "carteiras"} (dinheiro fictício)`
            : "Nenhuma carteira simulada";
    }

    /* ---------- observações ---------- */

    function mostrarObservacoes(lista) {
        const ul = $("relObservacoes");
        ul.replaceChildren(...lista.map(o => {
            const li = elemento("li", o.tipo);
            const icone = elemento("i", `bi ${ICONES[o.tipo] || ICONES.info}`);
            icone.setAttribute("aria-hidden", "true");
            li.append(icone, elemento("span", null, o.texto));
            return li;
        }));
    }

    /* ---------- distribuição e movimentação ---------- */

    function mostrarDistribuicao(lista) {
        const alvo = $("relDistribuicao");
        if (!lista.length) {
            alvo.replaceChildren(elemento("p", "rel-vazio", "Sem ativos nas carteiras reais."));
            return;
        }
        alvo.replaceChildren(...lista.map(item => {
            const bloco = elemento("div");
            const topo = elemento("div", "rel-barra-topo");
            topo.append(
                elemento("span", null, item.categoria),
                elemento("span", null, `${fmt.pct(item.percentual, 1).replace("+", "")} · ${fmt.brl(item.valor)}`)
            );
            const trilho = elemento("div", "rel-barra-trilho");
            const barra = elemento("span");
            barra.style.width = `${Math.max(2, Math.min(100, Number(item.percentual) || 0))}%`;
            trilho.appendChild(barra);
            bloco.append(topo, trilho);
            return bloco;
        }));
    }

    function mostrarMovimentacao(mov) {
        const alvo = $("relMovimentacao");
        const linhas = [
            ["", "Reais", "Simuladas"],
            ["Compras", `${mov.real.compras} · ${fmt.brl(mov.real.valor_comprado)}`, `${mov.simulada.compras} · ${fmt.brl(mov.simulada.valor_comprado)}`],
            ["Vendas", `${mov.real.vendas} · ${fmt.brl(mov.real.valor_vendido)}`, `${mov.simulada.vendas} · ${fmt.brl(mov.simulada.valor_vendido)}`],
            ["Dividendos", `${mov.real.dividendos} · ${fmt.brl(mov.real.valor_dividendos)}`, `${mov.simulada.dividendos} · ${fmt.brl(mov.simulada.valor_dividendos)}`]
        ];

        const celulas = [];
        linhas.forEach((linha, n) => linha.forEach((texto, coluna) => {
            celulas.push(elemento("span", `${n === 0 ? "cabecalho" : ""} ${coluna > 0 ? "num" : ""}`.trim(), texto));
        }));
        celulas.push(
            elemento("span", null, "Depósitos de saldo"),
            elemento("span", "num", `${mov.depositos} · ${fmt.brl(mov.valor_depositos)}`),
            elemento("span")
        );
        alvo.replaceChildren(...celulas);
    }

    /* ---------- carteiras e destaques ---------- */

    function mostrarCarteiras(lista) {
        const corpo = $("relCarteiras");
        if (!lista.length) {
            const tr = elemento("tr");
            const td = elemento("td", "v2-empty", "Você ainda não tem carteiras.");
            td.colSpan = 6;
            tr.appendChild(td);
            corpo.replaceChildren(tr);
            return;
        }

        corpo.replaceChildren(...lista.map(c => {
            const tr = elemento("tr");
            const simulada = c.tipo_carteira === "Simulada";
            const celula = (texto, rotulo, classe) => {
                const td = elemento("td", classe, texto);
                if (rotulo) td.dataset.rotulo = rotulo;
                return td;
            };
            const meta = Number(c.meta_carteira) > 0
                ? (c.meta_atingida ? "Atingida" : `${String(Math.round(c.progresso_meta)).replace(".", ",")}% de ${fmt.brl0(c.meta_carteira)}`)
                : "Sem meta";

            tr.append(
                celula(c.nome_carteira, null, "v2-celula-larga"),
                celula(simulada ? "Simulada" : "Real", "Tipo"),
                celula(fmt.brl(c.patrimonio_atual), "Patrimônio", "num"),
                celula(fmt.brl(c.total_investido), "Investido", "num"),
                celula(`${fmt.brl(c.lucro_prejuizo)} (${fmt.pct(c.rentabilidade_percentual, 2)})`, "Resultado", `num ${classeSinal(c.lucro_prejuizo)}`),
                celula(meta, "Meta", "num")
            );
            return tr;
        }));
    }

    function mostrarAtivos(alvoId, lista, vazio) {
        const alvo = $(alvoId);
        if (!lista.length) {
            alvo.replaceChildren(elemento("li", "rel-vazio", vazio));
            return;
        }
        alvo.replaceChildren(...lista.map(a => {
            const li = elemento("li");
            const nome = elemento("div");
            nome.append(
                elemento("strong", null, a.simbolo),
                elemento("small", null, `${a.carteira} · ${a.simulada ? "simulada" : "real"}`)
            );
            const variacao = elemento("span", `v2-delta ${Number(a.rentabilidade_percentual) >= 0 ? "up" : "down"}`, fmt.pct(a.rentabilidade_percentual, 2));
            li.append(nome, variacao);
            return li;
        }));
    }

    /* ---------- análise com IA ---------- */

    function mostrarTextoIa(texto) {
        const paragrafos = String(texto || "").split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
        $("relIaTexto").replaceChildren(...paragrafos.map(p => elemento("p", null, p)));
    }

    function contarEspera(segundos) {
        const botao = $("relIaGerar");
        clearInterval(relogioIa);
        let restante = Math.max(0, Math.ceil(segundos));

        const atualizar = () => {
            if (restante <= 0) {
                clearInterval(relogioIa);
                botao.disabled = false;
                botao.lastChild.textContent = " Gerar nova análise";
                return;
            }
            botao.disabled = true;
            botao.lastChild.textContent = ` Nova análise em ${Math.ceil(restante / 60)} min`;
            restante -= 30;
        };
        atualizar();
        if (restante > 0) relogioIa = setInterval(atualizar, 30000);
    }

    function mostrarIa(ia) {
        const botao = $("relIaGerar");
        const status = $("relIaStatus");

        if (!ia || !ia.disponivel) {
            mostrarTextoIa("");
            status.textContent = "A análise com IA não está ativada neste servidor. As observações ao lado são feitas com os mesmos números.";
            botao.hidden = true;
            return;
        }

        botao.hidden = false;
        if (ia.ultima) {
            mostrarTextoIa(ia.ultima.texto);
            status.textContent = `Gerada em ${new Date(ia.ultima.gerado_em).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.`;
            contarEspera(ia.ultima.espera_segundos);
        } else {
            mostrarTextoIa("");
            status.textContent = "Peça um texto que explica o seu relatório em linguagem simples.";
            botao.disabled = false;
            botao.lastChild.textContent = " Gerar análise";
        }
    }

    async function gerarAnalise() {
        const botao = $("relIaGerar");
        const status = $("relIaStatus");
        botao.disabled = true;
        status.textContent = "Escrevendo a análise... isso pode levar alguns segundos.";

        const { ok, dados } = await chamar("analise", { method: "POST", body: JSON.stringify({ dias: diasAtual }) })
            .catch(() => ({ ok: false, dados: { message: "Sem conexão com o servidor." } }));

        if (ok) {
            mostrarIa({ disponivel: true, ultima: dados.analise });
            return;
        }

        status.textContent = dados.message || "Não foi possível gerar a análise agora.";
        if (dados.analise) {
            mostrarTextoIa(dados.analise.texto);
            contarEspera(dados.analise.espera_segundos);
        } else {
            botao.disabled = false;
        }
    }

    /* ---------- carregar ---------- */

    async function carregar(dias) {
        diasAtual = dias;
        const estado = $("relEstado");
        estado.textContent = "Montando o relatório...";
        estado.hidden = false;
        $("relConteudo").hidden = true;

        const { ok, dados } = await chamar(`resumo?dias=${dias}`)
            .catch(() => ({ ok: false, dados: { message: "Sem conexão com o servidor. Verifique a internet e tente de novo." } }));

        if (!ok) {
            estado.textContent = dados.message || "Não foi possível montar o relatório agora.";
            return;
        }

        $("relPeriodo").textContent = `De ${dataCurta(dados.periodo.inicio)} a ${dataCurta(dados.periodo.fim)} · valores atualizados agora.`;
        mostrarNumeros(dados);
        mostrarObservacoes(dados.observacoes || []);
        mostrarDistribuicao(dados.distribuicao || []);
        mostrarMovimentacao(dados.movimentacao);
        mostrarCarteiras(dados.carteiras || []);
        mostrarAtivos("relAltas", dados.destaques.melhores || [], "Nenhum ativo em alta desde a compra.");
        mostrarAtivos("relQuedas", dados.destaques.piores || [], "Nenhum ativo em queda desde a compra.");
        mostrarIa(dados.analise_ia);
        $("relAviso").textContent = dados.aviso || "";

        estado.hidden = true;
        $("relConteudo").hidden = false;
    }

    $("relDias").addEventListener("change", evento => carregar(Number(evento.target.value)));
    $("relImprimir").addEventListener("click", () => window.print());
    $("relIaGerar").addEventListener("click", gerarAnalise);

    carregar(diasAtual);
})();
