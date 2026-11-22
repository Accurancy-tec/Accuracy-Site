/* =========================================================
   NOTÍCIAS DO DASHBOARD — somente leitura
   - Busca notícias realmente publicadas na API.
   - Não cria notícias de demonstração nem valores fictícios.
   - O estado vazio permanece visível quando não há notícias.
   - Administração será implementada em uma etapa futura.
========================================================= */
(function () {
    "use strict";

    const API_BASE_URL = "https://accuracyappapi.onrender.com";
    const secao = document.getElementById("v2News");
    if (!secao) return;

    const carrossel = document.getElementById("v2Carousel");
    const slidesEl = document.getElementById("v2Slides");
    const pontosEl = document.getElementById("v2Dots");
    const vazioEl = document.getElementById("v2NewsEmpty");
    const anterior = carrossel.querySelector(".prev");
    const proximo = carrossel.querySelector(".next");

    let noticias = [];
    let indiceAtual = 0;

    const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

    function elemento(tag, classe, texto) {
        const el = document.createElement(tag);
        if (classe) el.className = classe;
        if (texto !== undefined) el.textContent = texto;
        return el;
    }

    function urlSegura(valor) {
        return /^https?:\/\//i.test(String(valor || "").trim()) ? String(valor).trim() : "";
    }

    function dataLegivel(valor) {
        const m = String(valor || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
        return m ? `${Number(m[3])} ${meses[Number(m[2]) - 1]} ${m[1]}` : "";
    }

    function irPara(indice) {
        if (!noticias.length) return;
        indiceAtual = (indice + noticias.length) % noticias.length;
        slidesEl.style.transform = `translateX(-${indiceAtual * 100}%)`;
        [...slidesEl.children].forEach((slide, i) => {
            slide.setAttribute("aria-hidden", i === indiceAtual ? "false" : "true");
            if (i === indiceAtual) slide.removeAttribute("inert");
            else slide.setAttribute("inert", "");
        });
        [...pontosEl.children].forEach((ponto, i) => {
            ponto.classList.toggle("active", i === indiceAtual);
            ponto.setAttribute("aria-current", i === indiceAtual ? "true" : "false");
        });
    }

    function montarSlide(noticia, i) {
        const slide = elemento("article", "v2-slide");
        slide.setAttribute("role", "group");
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", `${i + 1} de ${noticias.length}`);

        const imagemUrl = urlSegura(noticia.imagem_noticia);
        if (imagemUrl) {
            const caixaImagem = elemento("div", `v2-slide-img g${(i % 4) + 1}`);
            const img = document.createElement("img");
            img.src = imagemUrl;
            img.alt = "";
            img.loading = "lazy";
            img.referrerPolicy = "no-referrer";
            img.addEventListener("error", () => img.remove());
            caixaImagem.appendChild(img);
            slide.appendChild(caixaImagem);
        } else {
            slide.classList.add("sem-imagem");
        }

        const corpo = elemento("div", "v2-slide-body");
        if (noticia.categoria_noticia) corpo.appendChild(elemento("span", "v2-tag", noticia.categoria_noticia));
        corpo.appendChild(elemento("h3", "", noticia.titulo_noticia || "Notícia do mercado"));
        corpo.appendChild(elemento("p", "", noticia.resumo_noticia || ""));

        const rodape = elemento("div", "v2-slide-foot");
        const link = urlSegura(noticia.link_noticia);
        if (link) {
            const a = elemento("a", "v2-btn", "Ler notícia");
            a.href = link;
            a.target = "_blank";
            a.rel = "noopener noreferrer";
            rodape.appendChild(a);
        }
        const data = dataLegivel(noticia.criado_em);
        if (data) rodape.appendChild(elemento("small", "", data));
        if (rodape.childElementCount) corpo.appendChild(rodape);
        slide.appendChild(corpo);
        return slide;
    }

    function renderizar() {
        slidesEl.replaceChildren();
        pontosEl.replaceChildren();
        const temNoticias = noticias.length > 0;

        carrossel.hidden = !temNoticias;
        vazioEl.hidden = temNoticias;
        carrossel.classList.toggle("unico", noticias.length < 2);

        if (!temNoticias) return;

        noticias.forEach((noticia, i) => {
            slidesEl.appendChild(montarSlide(noticia, i));
            const ponto = elemento("button");
            ponto.type = "button";
            ponto.setAttribute("aria-label", `Ir para a notícia ${i + 1}`);
            ponto.addEventListener("click", () => irPara(i));
            pontosEl.appendChild(ponto);
        });
        irPara(0);
    }

    anterior.addEventListener("click", () => irPara(indiceAtual - 1));
    proximo.addEventListener("click", () => irPara(indiceAtual + 1));
    carrossel.addEventListener("keydown", e => {
        if (e.key === "ArrowLeft") irPara(indiceAtual - 1);
        if (e.key === "ArrowRight") irPara(indiceAtual + 1);
    });

    async function carregarNoticias() {
        try {
            const token = localStorage.getItem("token");
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const resposta = await fetch(`${API_BASE_URL}/noticias/listar`, { headers });
            if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
            const dados = await resposta.json();
            noticias = Array.isArray(dados.noticias) ? dados.noticias : [];
        } catch (erro) {
            console.warn("Não foi possível carregar notícias publicadas:", erro);
            noticias = [];
        }
        renderizar();
    }

    carregarNoticias();
})();
