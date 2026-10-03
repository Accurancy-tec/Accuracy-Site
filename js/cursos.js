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
    // FILTROS DOS CURSOS
    // =====================================================

    const filters =
        document.querySelectorAll(".filter");

    const courseCards =
        document.querySelectorAll(".course-card");


    filters.forEach(function (filter) {

        filter.addEventListener(
            "click",
            function () {

                // Pega a categoria selecionada
                const category =
                    filter.getAttribute(
                        "data-category"
                    );


                // Remove active de todos
                filters.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                // Ativa o filtro clicado
                filter.classList.add("active");


                // Mostra/esconde os cursos
                courseCards.forEach(
                    function (card) {

                        const cardCategory =
                            card.getAttribute(
                                "data-category"
                            );


                        // Se for "Todos", mostra tudo
                        if (
                            category === "all" ||
                            cardCategory === category
                        ) {

                            card.classList.remove(
                                "hidden-course"
                            );

                        }

                        // Caso contrário, esconde
                        else {

                            card.classList.add(
                                "hidden-course"
                            );

                        }

                    }
                );

            }
        );

    });

});