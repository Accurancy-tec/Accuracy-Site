// Account report (GET relatorios/resumo?dias=N): numbers, notes and the Accuracy assistant's analysis.
(function () {
    "use strict";

    const API = window.ACCURACY_API_URL + "/relatorios/";
    const $ = id => document.getElementById(id);
    const fmt = window.V2Fmt;

    const NOTE_STYLES = {
        positivo: { className: "positive", icon: "bi-arrow-up-right-circle" },
        atencao: { className: "warning", icon: "bi-exclamation-circle" },
        info: { className: "info", icon: "bi-info-circle" },
        inicio: { className: "start", icon: "bi-stars" }
    };

    async function request(path) {
        const response = await fetch(API + path, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            }
        });
        const data = await response.json().catch(() => ({}));
        return { ok: response.ok && data.success === true, data };
    }

    function element(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function signClass(value) {
        const number = Number(value);
        return number > 0 ? "report-positive" : number < 0 ? "report-negative" : "";
    }

    function shortDate(iso) {
        const [year, month, day] = String(iso).split("-");
        return day && month && year ? `${day}/${month}/${year}` : "";
    }

    function percent(value) {
        return `${String(value).replace(".", ",")}%`;
    }

    function showNumbers(report) {
        const real = report.real;
        const simulated = report.simulado;

        $("reportNetWorth").textContent = fmt.brl(real.patrimonio_total);
        $("reportNetWorthDetail").textContent = `${fmt.brl(report.saldo_geral)} de saldo disponível`;

        $("reportInvested").textContent = fmt.brl(real.total_investido);
        $("reportInvestedDetail").textContent = `Valor atual: ${fmt.brl(real.valor_mercado)}`;

        const result = $("reportResult");
        result.textContent = fmt.brl(real.lucro_prejuizo);
        result.className = signClass(real.lucro_prejuizo);
        $("reportResultDetail").textContent = real.total_investido > 0
            ? `${fmt.pct(real.rentabilidade_percentual, 2)} sobre o valor aplicado`
            : "Ainda sem ativos nas carteiras reais";

        const walletCount = simulated.quantidade_carteiras;
        $("reportSimulated").textContent = walletCount > 0 ? fmt.brl(simulated.patrimonio_total) : "—";
        $("reportSimulatedDetail").textContent = walletCount > 0
            ? `${fmt.pct(simulated.rentabilidade_percentual, 2)} · ${walletCount} ${walletCount === 1 ? "carteira" : "carteiras"} (dinheiro fictício)`
            : "Nenhuma carteira simulada";
    }

    function showNotes(notes) {
        $("reportNotes").replaceChildren(...notes.map(note => {
            const style = NOTE_STYLES[note.tipo] || NOTE_STYLES.info;
            const item = element("li", style.className);
            const icon = element("i", `bi ${style.icon}`);
            icon.setAttribute("aria-hidden", "true");
            item.append(icon, element("span", null, note.texto));
            return item;
        }));
    }

    function showAnalysis(analysis) {
        const diagnosis = analysis.diagnosis;
        const diversification = diagnosis.diversification;

        $("reportDiversification").textContent = diversification.score == null ? "—" : `${diversification.score} de 100`;
        $("reportDiversificationLabel").textContent = diversification.label;
        $("reportRisk").textContent = diagnosis.risk.label;
        $("reportRiskBasis").textContent = diversification.score == null ? "" : `nas ${diversification.basis}`;
        $("reportIdleCash").textContent = diagnosis.idle_cash_percent == null ? "—" : percent(diagnosis.idle_cash_percent);

        $("reportParagraphs").replaceChildren(...analysis.paragraphs.map(text => element("p", null, text)));

        const study = analysis.study || [];
        $("reportStudy").hidden = study.length === 0;
        $("reportStudyList").replaceChildren(...study.map(trail => {
            const link = element("a");
            link.href = `trilha.php?id=${encodeURIComponent(trail.trail_id)}`;
            link.append(
                element("strong", null, `Trilha ${trail.trail}`),
                document.createTextNode(` · ${trail.completed} de ${trail.total} aulas concluídas`),
                element("small", null, trail.reason)
            );
            const item = element("li");
            item.appendChild(link);
            return item;
        }));
    }

    function showDistribution(categories) {
        const target = $("reportDistribution");
        if (!categories.length) {
            target.replaceChildren(element("p", "report-empty", "Sem ativos nas carteiras reais."));
            return;
        }
        target.replaceChildren(...categories.map(category => {
            const block = element("div");
            const head = element("div", "report-bar-head");
            head.append(
                element("span", null, category.categoria),
                element("span", null, `${fmt.pct(category.percentual, 1).replace("+", "")} · ${fmt.brl(category.valor)}`)
            );
            const track = element("div", "report-bar-track");
            const bar = element("span");
            bar.style.width = `${Math.max(2, Math.min(100, Number(category.percentual) || 0))}%`;
            track.appendChild(bar);
            block.append(head, track);
            return block;
        }));
    }

    function showActivity(activity) {
        const { real, simulada: simulated } = activity;
        const rows = [
            ["", "Reais", "Simuladas"],
            ["Compras", `${real.compras} · ${fmt.brl(real.valor_comprado)}`, `${simulated.compras} · ${fmt.brl(simulated.valor_comprado)}`],
            ["Vendas", `${real.vendas} · ${fmt.brl(real.valor_vendido)}`, `${simulated.vendas} · ${fmt.brl(simulated.valor_vendido)}`],
            ["Dividendos", `${real.dividendos} · ${fmt.brl(real.valor_dividendos)}`, `${simulated.dividendos} · ${fmt.brl(simulated.valor_dividendos)}`]
        ];

        const cells = [];
        rows.forEach((row, rowIndex) => row.forEach((text, column) => {
            cells.push(element("span", `${rowIndex === 0 ? "header" : ""} ${column > 0 ? "num" : ""}`.trim(), text));
        }));
        cells.push(
            element("span", null, "Depósitos de saldo"),
            element("span", "num", `${activity.depositos} · ${fmt.brl(activity.valor_depositos)}`),
            element("span")
        );
        $("reportActivity").replaceChildren(...cells);
    }

    function showWallets(wallets) {
        const body = $("reportWallets");
        if (!wallets.length) {
            const row = element("tr");
            const cell = element("td", "v2-empty", "Você ainda não tem carteiras.");
            cell.colSpan = 6;
            row.appendChild(cell);
            body.replaceChildren(row);
            return;
        }

        body.replaceChildren(...wallets.map(wallet => {
            const row = element("tr");
            const cell = (text, label, className) => {
                const td = element("td", className, text);
                if (label) td.dataset.rotulo = label;
                return td;
            };
            const goal = Number(wallet.meta_carteira) > 0
                ? (wallet.meta_atingida ? "Atingida" : `${Math.round(wallet.progresso_meta)}% de ${fmt.brl0(wallet.meta_carteira)}`)
                : "Sem meta";

            row.append(
                cell(wallet.nome_carteira, null, "v2-celula-larga"),
                cell(wallet.tipo_carteira === "Simulada" ? "Simulada" : "Real", "Tipo"),
                cell(fmt.brl(wallet.patrimonio_atual), "Patrimônio", "num"),
                cell(fmt.brl(wallet.total_investido), "Investido", "num"),
                cell(`${fmt.brl(wallet.lucro_prejuizo)} (${fmt.pct(wallet.rentabilidade_percentual, 2)})`, "Resultado", `num ${signClass(wallet.lucro_prejuizo)}`),
                cell(goal, "Meta", "num")
            );
            return row;
        }));
    }

    function showAssets(targetId, assets, emptyText) {
        const target = $(targetId);
        if (!assets.length) {
            target.replaceChildren(element("li", "report-empty", emptyText));
            return;
        }
        target.replaceChildren(...assets.map(asset => {
            const item = element("li");
            const name = element("div");
            name.append(
                element("strong", null, asset.simbolo),
                element("small", null, `${asset.carteira} · ${asset.simulada ? "simulada" : "real"}`)
            );
            const change = element("span", `v2-delta ${Number(asset.rentabilidade_percentual) >= 0 ? "up" : "down"}`, fmt.pct(asset.rentabilidade_percentual, 2));
            item.append(name, change);
            return item;
        }));
    }

    async function load(days) {
        const status = $("reportStatus");
        status.textContent = "Montando o relatório...";
        status.hidden = false;
        $("reportContent").hidden = true;

        const { ok, data } = await request(`resumo?dias=${days}`)
            .catch(() => ({ ok: false, data: { message: "Sem conexão com o servidor. Verifique a internet e tente de novo." } }));

        if (!ok) {
            status.textContent = data.message || "Não foi possível montar o relatório agora.";
            return;
        }

        $("reportPeriod").textContent = `De ${shortDate(data.periodo.inicio)} a ${shortDate(data.periodo.fim)} · valores atualizados agora.`;
        showNumbers(data);
        showNotes(data.observacoes || []);
        if (data.analysis) showAnalysis(data.analysis);
        showDistribution(data.distribuicao || []);
        showActivity(data.movimentacao);
        showWallets(data.carteiras || []);
        showAssets("reportBest", data.destaques.melhores || [], "Nenhum ativo em alta desde a compra.");
        showAssets("reportWorst", data.destaques.piores || [], "Nenhum ativo em queda desde a compra.");
        $("reportDisclaimer").textContent = data.aviso || "";

        status.hidden = true;
        $("reportContent").hidden = false;
    }

    $("reportDays").addEventListener("change", event => load(Number(event.target.value)));
    $("reportPrint").addEventListener("click", () => window.print());

    load(30);
})();
