(() => {
    "use strict";
    const API = window.ACCURACY_API_URL;
    const panel = document.querySelector(".featured-assets");
    if (!panel) return;
    const empty = panel.querySelector(".featured-assets-empty");
    const listClass = "accuracy-featured-list";
    let lastFetch = 0;
    let pending = false;

    const names = {
        COGN3: "Cogna Educação",
        B3SA3: "B3 — Brasil, Bolsa, Balcão",
        BBDC4: "Bradesco",
        MGLU3: "Magazine Luiza",
        PETR4: "Petrobras",
        VALE3: "Vale",
        ITUB4: "Itaú Unibanco",
        BBAS3: "Banco do Brasil",
        ABEV3: "Ambev",
        WEGE3: "WEG"
    };

    function el(tag, className, value) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (value !== undefined) node.textContent = value;
        return node;
    }
    const moeda = n => Number(n).toLocaleString("pt-BR", {
        style: "currency", currency: "BRL"
    });
    // Fontes alternativas: dados da API, icones da brapi e favicon oficial.
    // O favicon é só uma alternativa visual e pode não ser o logo completo.
    const accuracyLogoFallbackDomains = {
        COGN3: "cogna.com.br",
        B3SA3: "b3.com.br",
        BBDC4: "banco.bradesco",
        MGLU3: "magazineluiza.com.br",
        PETR4: "petrobras.com.br",
        VALE3: "vale.com",
        ITUB4: "itau.com.br",
        BBAS3: "bb.com.br",
        ABEV3: "ambev.com.br",
        WEGE3: "weg.net"
    };
    function logoCandidates(stock, ticker) {
        const urls = [];
        const provided = stock.logoUrl || stock.logourl || stock.logo || stock.logo_url;
        if (typeof provided === "string" && /^https:\/\//i.test(provided)) urls.push(provided);
        urls.push(`https://icons.brapi.dev/icons/${encodeURIComponent(ticker)}.svg`);
        const domain = accuracyLogoFallbackDomains[ticker];
        if (domain) {
            urls.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
        }
        return [...new Set(urls)];
    }
    function renderLogo(stock, ticker) {
        const wrap = el("span", "accuracy-featured-mark");
        const fallback = el("span", "accuracy-featured-fallback", ticker[0]);
        const img = document.createElement("img");
        img.className = "accuracy-featured-logo";
        img.alt = `Logo de ${names[ticker] || stock.name || ticker}`;
        img.loading = "eager";
        img.decoding = "async";
        const candidates = logoCandidates(stock, ticker);
        let index = 0;
        img.hidden = true;
        img.addEventListener("load", () => {
            img.hidden = false;
            fallback.hidden = true;
        });
        img.addEventListener("error", () => {
            if (index < candidates.length) {
                img.src = candidates[index++];
            } else {
                img.hidden = true;
                fallback.hidden = false;
            }
        });
        wrap.append(fallback, img);
        if (candidates.length) img.src = candidates[index++];
        return wrap;
    }
    function render(stocks) {
        const list = el("div", listClass);
        list.append(el("p", "accuracy-featured-source", "Mercado brasileiro · Ações mais negociadas por volume"));
        for (const stock of stocks) {
            const ticker = String(stock.stock).trim().toUpperCase();
            const row = el("div", "accuracy-featured-item");
            const info = el("div", "accuracy-featured-info");
            info.append(el("strong", "accuracy-featured-ticker", ticker));
            info.append(el("small", "accuracy-featured-name", names[ticker] || String(stock.name || ticker)));
            const value = el("div", "accuracy-featured-value");
            const price = Number(stock.close);
            value.append(el("strong", "", stock.close != null && Number.isFinite(price) ? moeda(price) : "Cotação indisponível"));
            const change = Number(stock.change);
            const valid = stock.change != null && Number.isFinite(change);
            const label = valid ? `${change > 0 ? "+" : ""}${change.toFixed(2).replace(".", ",")}%` : "Variação indisponível";
            const pct = el("small", "accuracy-featured-change", label);
            if (valid) pct.classList.add(change >= 0 ? "up" : "down");
            value.append(pct);
            row.append(renderLogo(stock, ticker), info, value);
            list.append(row);
        }
        list.append(el("small", "accuracy-featured-footnote", "Destaques por volume negociado. Não é recomendação de investimento."));
        panel.querySelector(`.${listClass}`)?.remove();
        if (empty) empty.style.display = "none";
        panel.append(list);
    }
    async function load(force = false) {
        if (pending || (!force && Date.now() - lastFetch < 300000)) return;
        pending = true;
        try {
            const resp = await fetch(`${API}/brapi/listar-acoes-nacionais?page=1&limit=20&sortBy=volume&sortOrder=desc`, {cache: "no-store"});
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (data.success !== true || !Array.isArray(data.stocks)) throw new Error("Resposta inesperada da API");
            const stocks = data.stocks.filter(s =>
                typeof s.stock === "string" && /^[A-Z0-9]{4,8}$/i.test(s.stock.trim()) &&
                Number.isFinite(Number(s.volume)) && Number(s.volume) > 0
            ).sort((a,b) => Number(b.volume) - Number(a.volume)).slice(0,4);
            if (!stocks.length) throw new Error("Nenhuma cotação disponível");
            render(stocks);
            lastFetch = Date.now();
        } catch (error) {
            console.error("Falha ao carregar destaques do mercado:", error);
            // Mantém os dados anteriores caso a atualização falhe.
            if (!panel.querySelector(`.${listClass}`) && empty) {
                empty.style.display = "";
                empty.querySelectorAll(".skeleton").forEach(s => s.remove());
                const message = empty.querySelector("p");
                if (message) {
                    message.hidden = false;
                    message.textContent = "Não foi possível carregar os destaques do mercado agora.";
                }
            }
        } finally { pending = false; }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => load(true), {once: true});
    else load(true);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) load(); });
    setInterval(() => { if (!document.hidden) load(); }, 300000);
})();