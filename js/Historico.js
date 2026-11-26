/* =========================================================
   HISTÓRICO

   Movimentações reais do usuário vindas da API
   (/aportes/historico-aportes): compras, vendas, dividendos
   e depósitos, com filtros por ativo, carteira, período e tipo.
   Uma operação pode ser excluída: a API desfaz o efeito dela
   no saldo e na posição (ou explica por que não pode).
========================================================= */
(function () {
    "use strict";

    const { brl } = window.V2Fmt;
    const $ = id => document.getElementById(id);

    const POR_PAGINA = 20;
    const fmtQtd = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 8 });

    const corpo = $("historicoCorpo");
    const paginacao = $("historicoPaginas");

    const filtros = { busca: "", carteira: "", periodo: "", tipo: "" };
    let movimentos = [];
    let pagina = 1;
    let pedido = 0;

    function esc(texto) {
        return String(texto ?? "").replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function dataBr(iso) {
        const [a, m, d] = String(iso || "").split("-");
        return a ? `${d}/${m}/${a}` : "—";
    }

    function dataInicio(dias) {
        if (!dias) return "";
        const data = new Date();
        data.setDate(data.getDate() - Number(dias));
        return data.toISOString().slice(0, 10);
    }

    async function buscar() {
        const parametros = new URLSearchParams();

        if (filtros.busca) parametros.set("busca", filtros.busca);
        if (filtros.carteira) parametros.set("id_carteira", filtros.carteira);
        if (filtros.periodo) parametros.set("inicio", dataInicio(filtros.periodo));
        if (["Compra", "Venda", "Dividendo"].includes(filtros.tipo)) parametros.set("tipo", filtros.tipo);

        // Depósitos não têm ativo: entram só sem busca por ativo e quando o tipo permite.
        const comDepositos = !filtros.busca && (filtros.tipo === "" || filtros.tipo === "Deposito");
        if (comDepositos) parametros.set("incluir_depositos", "1");

        const resposta = await fetch(`${window.ACCURACY_API_URL}/aportes/historico-aportes?${parametros}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const dados = await resposta.json().catch(() => ({}));

        if (!resposta.ok || dados.sucesso !== true) {
            throw new Error(dados.mensagem || `HTTP ${resposta.status}`);
        }

        const operacoes = filtros.tipo === "Deposito" ? [] : (dados.aportes || []).map(a => ({
            tipo: a.tipo_aporte,
            id: a.id_aporte,
            data: a.data_aporte,
            registrado: a.registrado_em || "",
            ativo: a.ativo_aporte,
            nomeAtivo: a.name_ativo,
            categoria: a.categoria_ativo,
            carteira: a.nome_carteira,
            tipoCarteira: a.tipo_carteira,
            quantidade: Number(a.quantidade_aporte) || 0,
            preco: a.detalhe_renda_variavel?.preco_unitario ?? (Number(a.quantidade_aporte) > 0 ? Number(a.valor_aporte) / Number(a.quantidade_aporte) : null),
            valor: Number(a.valor_aporte) || 0
        }));

        const depositos = (dados.depositos || []).map(d => ({
            tipo: "Deposito",
            id: `d${d.id_transacao}`,
            data: d.data,
            registrado: d.registrado_em || "",
            ativo: null,
            nomeAtivo: d.descricao,
            carteira: d.nome_carteira || "Saldo geral",
            tipoCarteira: d.id_carteira ? "Simulada" : null,
            quantidade: null,
            preco: null,
            valor: Number(d.valor) || 0
        }));

        return {
            lista: [...operacoes, ...depositos].sort((a, b) => b.data.localeCompare(a.data) || b.registrado.localeCompare(a.registrado)),
            resumo: dados.resumo,
            comDepositos
        };
    }

    function pintarTotais(resumo, comDepositos) {
        const valores = {
            totalCompras: filtros.tipo === "Deposito" ? 0 : resumo.total_compras,
            totalVendas: filtros.tipo === "Deposito" ? 0 : resumo.total_vendas,
            totalDividendos: filtros.tipo === "Deposito" ? 0 : resumo.total_dividendos,
            totalDepositos: comDepositos ? resumo.total_depositos || 0 : 0
        };

        Object.entries(valores).forEach(([id, valor]) => {
            const el = $(id);
            el.textContent = brl(valor);
            el.classList.remove("carregando-texto");
        });
    }

    const ROTULOS = { Compra: "Compra", Venda: "Venda", Dividendo: "Dividendo", Deposito: "Depósito" };

    function linha(m) {
        const ativo = m.ativo
            ? `<strong>${esc(m.ativo)}</strong>${m.nomeAtivo && m.nomeAtivo !== m.ativo ? ` <span class="muted">${esc(m.nomeAtivo)}</span>` : ""}`
            : `<span class="muted">${esc(m.nomeAtivo || "Depósito")}</span>`;

        const carteira = `${esc(m.carteira)}${m.tipoCarteira === "Simulada" ? ' <span class="historico-sim">simulada</span>' : ""}`;
        const entrada = m.tipo !== "Compra";

        return `
            <tr>
                <td data-rotulo="Data">${esc(dataBr(m.data))}</td>
                <td data-rotulo="Operação"><span class="historico-op ${m.tipo.toLowerCase()}">${esc(ROTULOS[m.tipo] || m.tipo)}</span></td>
                <td class="v2-wide v2-celula-larga" data-rotulo="Ativo">${ativo}</td>
                <td class="v2-wide" data-rotulo="Carteira">${carteira}</td>
                <td class="num" data-rotulo="Quantidade">${m.quantidade ? esc(fmtQtd.format(m.quantidade)) : "—"}</td>
                <td class="num" data-rotulo="Preço unit.">${m.preco ? esc(brl(m.preco)) : "—"}</td>
                <td class="num ${entrada ? "green" : ""}" data-rotulo="Valor">${entrada ? "+" : "−"}${esc(brl(m.valor))}</td>
                <td class="num v2-celula-acao">${typeof m.id === "number" ? `<button type="button" class="historico-excluir" data-id="${m.id}" aria-label="Excluir ${esc(ROTULOS[m.tipo])} de ${esc(m.ativo)}"><i class="bi bi-trash3" aria-hidden="true"></i></button>` : ""}</td>
            </tr>`;
    }

    function desenhar() {
        const total = movimentos.length;
        const paginas = Math.max(1, Math.ceil(total / POR_PAGINA));
        pagina = Math.min(pagina, paginas);

        if (!total) {
            corpo.innerHTML = `<tr><td colspan="8" class="v2-empty historico-vazio">
                ${filtros.busca || filtros.carteira || filtros.periodo || filtros.tipo
                    ? "Nenhuma movimentação com esses filtros."
                    : 'Você ainda não tem movimentações. <a href="aportes.php">Faça o primeiro aporte</a>.'}
            </td></tr>`;
            paginacao.hidden = true;
            return;
        }

        corpo.innerHTML = movimentos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA).map(linha).join("");
        corpo.classList.remove("v2-entrar");
        void corpo.offsetWidth;
        corpo.classList.add("v2-entrar");

        paginacao.hidden = paginas <= 1;
        $("paginaAtual").textContent = `Página ${pagina} de ${paginas} · ${total} movimentações`;
        $("paginaAnterior").disabled = pagina <= 1;
        $("paginaSeguinte").disabled = pagina >= paginas;
    }

    async function carregar() {
        const meu = ++pedido;
        corpo.setAttribute("aria-busy", "true");

        try {
            const { lista, resumo, comDepositos } = await buscar();
            if (meu !== pedido) return;

            movimentos = lista;
            pintarTotais(resumo, comDepositos);
            desenhar();
        } catch (erro) {
            if (meu !== pedido) return;
            corpo.innerHTML = '<tr><td colspan="8" class="v2-empty">Não foi possível carregar o histórico. Tente novamente em instantes.</td></tr>';
        } finally {
            if (meu === pedido) corpo.setAttribute("aria-busy", "false");
        }
    }

    async function excluir(id) {
        const movimento = movimentos.find(m => m.id === id);
        if (!movimento) return;

        const efeito = movimento.tipo === "Compra"
            ? `O valor de ${brl(movimento.valor)} volta para o saldo e a posição é recalculada.`
            : `O valor de ${brl(movimento.valor)} sai do saldo e a posição é recalculada.`;

        if (!window.confirm(`Excluir esta ${ROTULOS[movimento.tipo].toLowerCase()} de ${movimento.ativo}?\n\n${efeito}`)) return;

        try {
            const resposta = await fetch(`${window.ACCURACY_API_URL}/aportes/excluir-aporte`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ id_aporte: id })
            });
            const dados = await resposta.json().catch(() => ({}));

            if (!resposta.ok || dados.sucesso !== true) {
                throw new Error(dados.mensagem || "Não foi possível excluir a operação.");
            }

            window.V2Toast("Operação excluída e saldo ajustado.");
            window.V2Atualizar?.();
            carregar();
        } catch (erro) {
            window.V2Toast(erro.message);
        }
    }


    /* =========================
       EVENTOS
    ========================= */

    let espera = null;
    $("filtroBusca").addEventListener("input", e => {
        clearTimeout(espera);
        espera = setTimeout(() => {
            filtros.busca = e.target.value.trim();
            pagina = 1;
            carregar();
        }, 350);
    });

    $("historicoFiltros").addEventListener("submit", e => e.preventDefault());

    $("filtroCarteira").addEventListener("change", e => {
        filtros.carteira = e.target.value;
        pagina = 1;
        carregar();
    });

    $("filtroPeriodo").addEventListener("change", e => {
        filtros.periodo = e.target.value;
        pagina = 1;
        carregar();
    });

    document.querySelectorAll(".historico-tipos button").forEach(botao => botao.addEventListener("click", () => {
        document.querySelectorAll(".historico-tipos button").forEach(b => {
            const ativo = b === botao;
            b.classList.toggle("ativo", ativo);
            b.setAttribute("aria-pressed", String(ativo));
        });
        filtros.tipo = botao.dataset.tipo;
        pagina = 1;
        carregar();
    }));

    $("paginaAnterior").addEventListener("click", () => { pagina--; desenhar(); });
    $("paginaSeguinte").addEventListener("click", () => { pagina++; desenhar(); });

    corpo.addEventListener("click", e => {
        const botao = e.target.closest(".historico-excluir");
        if (botao) excluir(Number(botao.dataset.id));
    });

    // Carteiras para o filtro
    window.V2Dados.carregar().then(dados => {
        const select = $("filtroCarteira");
        dados.carteiras.forEach(c => {
            const opcao = document.createElement("option");
            opcao.value = c.id_carteira;
            opcao.textContent = `${c.nome_carteira}${c.tipo_carteira === "Simulada" ? " (simulada)" : ""}`;
            select.appendChild(opcao);
        });
    }).catch(() => { /* o filtro por carteira fica só com "Todas" */ });

    carregar();
})();
