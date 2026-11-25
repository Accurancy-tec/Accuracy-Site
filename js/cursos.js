// =========================================================
// PÁGINA DE CURSOS (visual novo + trilhas da API)
// Busca as trilhas na API, desenha os cards, mostra o
// progresso de cada trilha e leva para trilha.php ao clicar.
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    const API_BASE_URL = window.ACCURACY_API_URL;

    const grid = document.getElementById("trilhasGrid");
    const vazio = document.getElementById("coursesEmpty");
    const filters = document.querySelectorAll(".filter");

    let trilhas = [];
    let categoriaAtual = "all";
    let termoBusca = "";
    let alvoDoHero = null;

    // Nome bonito de cada categoria
    const NOMES = {
        "iniciante": "Iniciante",
        "renda-fixa": "Renda fixa",
        "fiis": "FIIs",
        "acoes": "Ações",
        "cripto": "Cripto"
    };

    // Transforma "Renda Fixa" em "renda-fixa", "Ações" em "acoes"
    function categoriaDe(titulo) {
        return String(titulo)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-");
    }

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function abrirTrilha(id) {
        window.location.href = "trilha.php?id=" + encodeURIComponent(id);
    }

    function classeIcone(trilha) {
        return /^bi-[a-z0-9-]+$/.test(trilha.icone_trilha || "")
            ? trilha.icone_trilha
            : "bi-mortarboard-fill";
    }

    function progressoDe(trilha) {
        const P = window.AccuracyProgresso;
        const total = P.lista(trilha.id_trilha).length;
        const feitos = P ? P.ler(trilha.id_trilha).length : 0;
        const pct = P ? P.percentual(feitos, total) : 0;
        return { total: total, feitos: feitos, pct: pct };
    }

    function textoMeta(trilha, total) {
        const cat = categoriaDe(trilha.titulo_trilha);
        const nome = NOMES[cat] || trilha.titulo_trilha;
        return nome + " · " + total + (total === 1 ? " vídeo" : " vídeos");
    }

    function limparGrid() {
        Array.from(grid.children).forEach(function (el) {
            if (el !== vazio) el.remove();
        });
    }

    function mostrarMensagem(texto, comBotao) {
        limparGrid();
        if (vazio) vazio.hidden = true;

        const p = document.createElement("p");
        p.className = "trilhas-status";
        p.textContent = texto;

        if (comBotao) {
            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = "Tentar de novo";
            botao.addEventListener("click", carregarTrilhas);
            p.appendChild(botao);
        }

        grid.insertBefore(p, vazio || null);
    }

    function criarCard(trilha) {

        const cat = categoriaDe(trilha.titulo_trilha);
        const corCat = NOMES[cat] ? cat : "iniciante";
        const p = progressoDe(trilha);

        const card = document.createElement("article");
        card.className = "course-card";
        card.setAttribute("data-category", cat);
        card.setAttribute("data-id", trilha.id_trilha);

        const thumb = document.createElement("div");
        thumb.className = "v2-thumb cat-" + corCat;

        const icone = document.createElement("i");
        icone.className = "bi thumb-icon " + classeIcone(trilha);
        thumb.appendChild(icone);

        const play = document.createElement("button");
        play.type = "button";
        play.className = "play-button";
        play.setAttribute("aria-label", "Abrir trilha " + trilha.titulo_trilha);
        const iconePlay = document.createElement("i");
        iconePlay.className = "bi bi-play-fill";
        play.appendChild(iconePlay);
        thumb.appendChild(play);

        const titulo = document.createElement("h3");
        titulo.textContent = trilha.titulo_trilha;

        const meta = document.createElement("div");
        meta.className = "v2-course-meta";
        meta.textContent = textoMeta(trilha, p.total);

        const barra = document.createElement("div");
        barra.className = "v2-progress";
        const preenchimento = document.createElement("i");
        preenchimento.style.width = p.pct + "%";
        barra.appendChild(preenchimento);

        const pct = document.createElement("span");
        pct.className = "v2-pct";
        pct.textContent = p.pct + "% concluído";

        card.appendChild(thumb);
        card.appendChild(titulo);
        card.appendChild(meta);
        card.appendChild(barra);
        card.appendChild(pct);

        card.addEventListener("click", function () {
            abrirTrilha(trilha.id_trilha);
        });

        return card;
    }

    // ----- Destaque: primeira trilha ainda não concluída -----
    function atualizarHero() {

        if (trilhas.length === 0) return;

        const progressos = trilhas.map(progressoDe);
        const indicePendente = progressos.findIndex(function (p) { return p.pct < 100; });
        const tudoFeito = indicePendente === -1;
        const indice = tudoFeito ? 0 : indicePendente;
        const alvo = trilhas[indice];
        const p = progressos[indice];
        const comeco = progressos.every(function (x) { return x.pct === 0; });

        alvoDoHero = alvo.id_trilha;

        function definir(id, valor) {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        }

        definir("heroTag", tudoFeito ? "Tudo concluído" : (comeco ? "Comece por aqui" : "Continue de onde parou"));
        definir("heroTitle", alvo.titulo_trilha);
        definir("heroMeta", textoMeta(alvo, p.total));
        definir("heroBtn", tudoFeito ? "Rever trilha" : (comeco ? "Começar trilha" : "Continuar trilha"));

        const barra = document.querySelector("#heroBar i");
        if (barra) barra.style.width = p.pct + "%";

        const cat = categoriaDe(alvo.titulo_trilha);
        const thumb = document.getElementById("heroThumb");
        if (thumb) thumb.className = "v2-thumb cat-" + (NOMES[cat] ? cat : "iniciante");

        const icone = document.getElementById("heroIcon");
        if (icone) icone.className = "bi thumb-icon " + classeIcone(alvo);
    }

    ["heroPlay", "heroBtn"].forEach(function (id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("click", function () {
                if (alvoDoHero !== null) abrirTrilha(alvoDoHero);
            });
        }
    });

    // ----- Filtros + busca do topo -----
    function aplicarFiltros() {

        const termo = normalizar(termoBusca.trim());
        let visiveis = 0;

        grid.querySelectorAll(".course-card").forEach(function (card) {
            const daCategoria = categoriaAtual === "all" || card.getAttribute("data-category") === categoriaAtual;
            const doTexto = !termo || normalizar(card.textContent).includes(termo);
            card.classList.toggle("hidden-course", !(daCategoria && doTexto));
            if (daCategoria && doTexto) visiveis++;
        });

        if (vazio) vazio.hidden = trilhas.length === 0 || visiveis > 0;
    }

    filters.forEach(function (filtro) {
        filtro.addEventListener("click", function () {
            categoriaAtual = filtro.getAttribute("data-category");
            filters.forEach(function (item) { item.classList.remove("active"); });
            filtro.classList.add("active");
            aplicarFiltros();
        });
    });

    window.addEventListener("v2:busca", function (e) {
        termoBusca = String(e.detail || "");
        aplicarFiltros();
    });

    // ----- Busca as trilhas na API -----
    async function carregarTrilhas() {

        mostrarMensagem("Carregando trilhas... (a primeira vez pode demorar um pouco)", false);

        try {

            const resposta = await fetch(API_BASE_URL + "/cursos/trilhas");
            const dados = await resposta.json();

            if (!resposta.ok || !dados.success) {
                throw new Error(dados.message || "Erro ao buscar as trilhas");
            }

            if (!dados.trilhas || dados.trilhas.length === 0) {
                trilhas = [];
                mostrarMensagem("Nenhuma trilha disponível no momento.", false);
                return;
            }

            await window.AccuracyProgresso.carregar();
            trilhas = dados.trilhas;

            limparGrid();
            trilhas.forEach(function (trilha) {
                grid.insertBefore(criarCard(trilha), vazio || null);
            });

            atualizarHero();
            aplicarFiltros();

        } catch (erro) {

            console.error("Erro ao carregar trilhas:", erro);
            trilhas = [];
            alvoDoHero = null;
            document.getElementById("heroTitle").textContent = "Progresso indisponível";
            document.getElementById("heroBtn").textContent = "Tente novamente";
            mostrarMensagem("Não foi possível carregar as trilhas e o progresso. Tente novamente.", true);

        }
    }

    // Ao voltar de uma trilha, busca novamente o progresso no banco.
    window.addEventListener("pageshow", function (e) {
        if (e.persisted) carregarTrilhas();
    });

    carregarTrilhas();
});
