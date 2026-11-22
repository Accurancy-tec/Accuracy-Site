document.addEventListener("DOMContentLoaded", function () {

    // =====================================================
    // ELEMENTOS DO VÍDEO
    // =====================================================

    const videoModal = document.getElementById("videoModal");
    const youtubePlayer = document.getElementById("youtubePlayer");
    const closeVideo = document.getElementById("closeVideo");

    // Botões que abrem vídeos
       const playButtons = document.querySelectorAll(
        ".play-button, .watch-btn");

    console.log("Player carregado.");
    console.log("Botões encontrados:", playButtons.length);


    // =====================================================
    // ABRIR VÍDEO
    // =====================================================

    function abrirVideo(videoId) {

        marcarAssistido(videoId);


        // Verifica se os elementos existem
        if (!videoModal || !youtubePlayer) {

            console.error(
                "Modal ou iframe do vídeo não encontrado."
            );

            return;
        }


        // Verifica se existe ID do vídeo
        if (!videoId) {

            console.warn(
                "Este botão não possui data-video."
            );

            return;
        }


        // Monta a URL do YouTube
        const url =
            "https://www.youtube.com/embed/" +
            encodeURIComponent(videoId) +
            "?autoplay=1&playsinline=1&rel=0";


        console.log("ID do vídeo:", videoId);
        console.log("URL:", url);


        // Coloca o vídeo no iframe
        youtubePlayer.src = url;


        // Abre o modal
        videoModal.classList.add("show");

        videoModal.setAttribute(
            "aria-hidden",
            "false"
        );


        // Bloqueia o scroll da página
        document.body.style.overflow = "hidden";
    }


    // =====================================================
    // FECHAR VÍDEO
    // =====================================================

    function fecharVideo() {

        if (!videoModal || !youtubePlayer) {
            return;
        }


        // Remove o vídeo do iframe
        // Isso também faz o vídeo parar
        youtubePlayer.src = "";


        // Fecha o modal
        videoModal.classList.remove("show");

        videoModal.setAttribute(
            "aria-hidden",
            "true"
        );


        // Libera o scroll
        document.body.style.overflow = "";
    }


    // =====================================================
    // BOTÕES DE PLAY
    // =====================================================

    playButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();


                // Pega o ID do vídeo
                const videoId =
                    button.getAttribute("data-video");


                // Abre o vídeo
                abrirVideo(videoId);
            }
        );

    });


    // =====================================================
    // BOTÃO X
    // =====================================================

    if (closeVideo) {

        closeVideo.addEventListener(
            "click",
            function () {

                fecharVideo();

            }
        );

    }


    // =====================================================
    // CLICAR FORA DO VÍDEO
    // =====================================================

    if (videoModal) {

        videoModal.addEventListener(
            "click",
            function (event) {

                // Só fecha se clicar no fundo escuro
                if (event.target === videoModal) {

                    fecharVideo();

                }

            }
        );

    }


    // =====================================================
    // TECLA ESC
    // =====================================================

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {

                fecharVideo();

            }

        }
    );

    // =====================================================
    // PROGRESSO (guardado só neste navegador)
    // =====================================================
    const CHAVE_VISTOS = "accuracy_cursos_vistos";

    function lerVistos() {
        try {
            return JSON.parse(localStorage.getItem(CHAVE_VISTOS)) || [];
        } catch (erro) {
            return [];
        }
    }

    function marcarAssistido(videoId) {
        const vistos = lerVistos();

        if (videoId && !vistos.includes(videoId)) {
            vistos.push(videoId);

            try {
                localStorage.setItem(CHAVE_VISTOS, JSON.stringify(vistos));
            } catch (erro) { /* sem storage: só não lembra */ }
        }

        atualizarProgresso();
    }

    const courseCards = document.querySelectorAll(".course-card");

    function dadosDoCurso(card) {
        return {
            video: card.dataset.id,
            titulo: card.querySelector("h3").textContent.trim(),
            meta: card.querySelector(".v2-course-meta").textContent.trim(),
            categoria: card.dataset.category
        };
    }

    function atualizarProgresso() {
        const vistos = lerVistos();

        courseCards.forEach(function (card) {
            const feito = vistos.includes(card.dataset.id);
            const barra = card.querySelector(".v2-progress i");
            const texto = card.querySelector(".v2-pct");

            if (barra) barra.style.width = feito ? "100%" : "0%";
            if (texto) texto.textContent = feito ? "100% concluído" : "0% concluído";
        });

        // destaque: primeiro curso ainda não assistido
        const cursos = Array.from(courseCards).map(dadosDoCurso);
        const pendente = cursos.find(function (c) { return !vistos.includes(c.video); });
        const alvo = pendente || cursos[cursos.length - 1];

        if (!alvo) return;

        const nenhum = vistos.length === 0;

        const set = function (id, valor) {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        };

        set("heroTag", !pendente ? "Tudo concluído" : (nenhum ? "Comece por aqui" : "Continue de onde parou"));
        set("heroTitle", alvo.titulo);
        set("heroMeta", alvo.meta);
        set("heroBtn", !pendente ? "Assistir novamente" : (nenhum ? "Assistir curso" : "Continuar curso"));

        const barraHero = document.querySelector("#heroBar i");
        if (barraHero) barraHero.style.width = pendente ? "0%" : "100%";

        ["heroPlay", "heroBtn"].forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.setAttribute("data-video", alvo.video);
        });

        const img = document.getElementById("heroImg");
        if (img) img.src = "https://img.youtube.com/vi/" + alvo.video + "/maxresdefault.jpg";

        const thumb = document.getElementById("heroThumb");
        if (thumb) thumb.className = "v2-thumb cat-" + alvo.categoria;
    }

    // =====================================================
    // FILTROS + BUSCA DO TOPO
    // =====================================================
    const filters = document.querySelectorAll(".filter");
    let categoriaAtual = "all";
    let termoBusca = "";

    function normalizar(texto) {
        return String(texto || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }

    function aplicarFiltros() {
        const termo = normalizar(termoBusca.trim());
        let visiveis = 0;

        courseCards.forEach(function (card) {
            const daCategoria = categoriaAtual === "all" || card.dataset.category === categoriaAtual;
            const doTexto = !termo || normalizar(card.textContent).includes(termo);

            card.classList.toggle("hidden-course", !(daCategoria && doTexto));

            if (daCategoria && doTexto) visiveis++;
        });

        const vazio = document.getElementById("coursesEmpty");
        if (vazio) vazio.hidden = visiveis > 0;
    }

    filters.forEach(function (filter) {
        filter.addEventListener("click", function () {
            categoriaAtual = filter.getAttribute("data-category");

            filters.forEach(function (item) {
                item.classList.remove("active");
            });

            filter.classList.add("active");
            aplicarFiltros();
        });
    });

    window.addEventListener("v2:busca", function (e) {
        termoBusca = String(e.detail || "");
        aplicarFiltros();
    });

    atualizarProgresso();
});
