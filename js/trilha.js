// =========================================================
// PÁGINA DE UMA TRILHA
// Lê o id na URL (trilha.php?id=1), busca a trilha na API,
// mostra o player da playlist do YouTube e, ao lado, a lista
// com todos os vídeos. Também guarda quais vídeos o aluno já
// assistiu e mostra a barra de progresso.
// =========================================================

document.addEventListener("DOMContentLoaded", async function () {

    const API_BASE_URL = "https://accuracyappapi.onrender.com";

    // Quando o aluno chega a esta parte do vídeo, conta como assistido
    const PERCENTUAL_ASSISTIDO = 0.8;

    const titulo = document.getElementById("trilhaTitulo");
    const descricao = document.getElementById("trilhaDescricao");
    const moldura = document.getElementById("playerFrame");
    const dica = document.getElementById("playerHint");

    const lista = document.getElementById("playlistLista");
    const contagem = document.getElementById("playlistContagem");

    const boxProgresso = document.getElementById("trilhaProgresso");
    const barraProgresso = document.getElementById("trilhaProgressoBarra");
    const fillProgresso = document.getElementById("trilhaProgressoFill");
    const textoProgresso = document.getElementById("trilhaProgressoTexto");

    let idTrilha = null;
    let totalNoBanco = 0;

    let player = null;
    let idsVideos = [];
    let botoes = [];
    let indiceAtual = -1;
    let listaMontada = false;
    let tentativasLista = 0;
    let timerProgresso = null;
    let assistidos = [];


    // ---------------------------------------------------------
    // Mensagens
    // ---------------------------------------------------------

    function mostrarErro(texto) {
        titulo.textContent = "Trilha não encontrada";
        descricao.textContent = "";
        moldura.innerHTML = "";

        const p = document.createElement("p");
        p.className = "trilhas-status";
        p.textContent = texto;
        moldura.appendChild(p);

        mostrarMensagemLista("Nenhum vídeo para mostrar.");
    }

    function mostrarMensagemLista(texto) {
        lista.innerHTML = "";

        const item = document.createElement("li");
        item.className = "playlist-status";
        item.textContent = texto;
        lista.appendChild(item);
    }


    // ---------------------------------------------------------
    // Barra de progresso
    // ---------------------------------------------------------

    function atualizarProgresso() {

        const total = idsVideos.length || totalNoBanco;

        if (!total || !window.AccuracyProgresso) {
            boxProgresso.hidden = true;
            return;
        }

        const feitos = idsVideos.length
            ? idsVideos.filter(function (id) {
                return assistidos.indexOf(id) !== -1;
            }).length
            : Math.min(assistidos.length, total);

        const pct = window.AccuracyProgresso.percentual(feitos, total);

        fillProgresso.style.width = pct + "%";
        barraProgresso.setAttribute("aria-valuenow", String(pct));
        textoProgresso.textContent =
            feitos + " de " + total + (total === 1 ? " vídeo" : " vídeos") +
            " assistidos · " + pct + "%";

        boxProgresso.hidden = false;
    }

    function atualizarMarcas() {
        botoes.forEach(function (botao, i) {
            botao.classList.toggle(
                "watched",
                assistidos.indexOf(idsVideos[i]) !== -1
            );
        });
    }

    function idVideoAtual() {
        try {
            const dados = player.getVideoData();
            if (dados && dados.video_id) {
                return dados.video_id;
            }
        } catch (erro) { /* ignora */ }

        return idsVideos[indiceAtual] || null;
    }

    function marcarAtualComoAssistido() {

        const id = idVideoAtual();

        if (!id || !window.AccuracyProgresso || assistidos.indexOf(id) !== -1) {
            return;
        }

        assistidos = window.AccuracyProgresso.marcar(idTrilha, id);
        atualizarMarcas();
        atualizarProgresso();
    }

    // Enquanto o vídeo toca, confere de tempos em tempos se já passou de 80%
    function iniciarTimer() {
        pararTimer();

        timerProgresso = setInterval(function () {
            try {
                const duracao = player.getDuration();
                const tempo = player.getCurrentTime();

                if (duracao > 0 && tempo / duracao >= PERCENTUAL_ASSISTIDO) {
                    marcarAtualComoAssistido();
                }
            } catch (erro) { /* ignora */ }
        }, 3000);
    }

    function pararTimer() {
        if (timerProgresso) {
            clearInterval(timerProgresso);
            timerProgresso = null;
        }
    }


    // ---------------------------------------------------------
    // Lista de vídeos (lado direito)
    // ---------------------------------------------------------

    function definirTituloDoVideo(idVideo, texto) {
        const posicao = idsVideos.indexOf(idVideo);

        if (posicao === -1 || !texto || !botoes[posicao]) {
            return;
        }

        botoes[posicao].querySelector(".playlist-title").textContent = texto;
    }

    // Busca o título de cada vídeo (se falhar, fica "Vídeo N")
    function buscarTitulos() {
        idsVideos.forEach(function (idVideo) {

            const endereco =
                "https://www.youtube.com/oembed?format=json&url=" +
                encodeURIComponent("https://www.youtube.com/watch?v=" + idVideo);

            fetch(endereco)
                .then(function (resposta) {
                    return resposta.ok ? resposta.json() : null;
                })
                .then(function (dados) {
                    if (dados && dados.title) {
                        definirTituloDoVideo(idVideo, dados.title);
                    }
                })
                .catch(function () { /* mantém o título provisório */ });
        });
    }

    function destacarAtual() {

        let indice = -1;

        try {
            indice = player.getPlaylistIndex();
        } catch (erro) { /* ignora */ }

        if (typeof indice !== "number" || indice < 0 || indice >= botoes.length) {
            return;
        }

        indiceAtual = indice;

        botoes.forEach(function (botao, i) {
            botao.classList.toggle("active", i === indice);
        });

        // rola só a lista (não a página) para o vídeo atual ficar visível
        const botao = botoes[indice];
        const topo = botao.offsetTop - (lista.clientHeight - botao.clientHeight) / 2;
        lista.scrollTo({ top: Math.max(0, topo), behavior: "smooth" });
    }

    function montarLista() {

        listaMontada = true;
        lista.innerHTML = "";
        botoes = [];

        idsVideos.forEach(function (idVideo, i) {

            const li = document.createElement("li");

            const botao = document.createElement("button");
            botao.type = "button";
            botao.className = "playlist-item";

            const numero = document.createElement("span");
            numero.className = "playlist-num";
            numero.textContent = String(i + 1);

            const miniatura = document.createElement("span");
            miniatura.className = "playlist-thumb";

            const imagem = document.createElement("img");
            imagem.src = "https://i.ytimg.com/vi/" + encodeURIComponent(idVideo) + "/mqdefault.jpg";
            imagem.alt = "";
            imagem.loading = "lazy";
            miniatura.appendChild(imagem);

            const nome = document.createElement("span");
            nome.className = "playlist-title";
            nome.textContent = "Vídeo " + (i + 1);

            const check = document.createElement("i");
            check.className = "bi bi-check-circle-fill playlist-check";
            check.setAttribute("title", "Assistido");

            botao.appendChild(numero);
            botao.appendChild(miniatura);
            botao.appendChild(nome);
            botao.appendChild(check);

            botao.addEventListener("click", function () {
                try {
                    player.playVideoAt(i);
                } catch (erro) {
                    console.error("Não foi possível trocar de vídeo:", erro);
                }
            });

            li.appendChild(botao);
            lista.appendChild(li);
            botoes.push(botao);
        });

        contagem.textContent =
            idsVideos.length + (idsVideos.length === 1 ? " vídeo" : " vídeos");

        atualizarMarcas();
        atualizarProgresso();
        destacarAtual();
        buscarTitulos();
    }

    // O YouTube demora um instante para informar os vídeos da playlist,
    // por isso tentamos algumas vezes até a lista aparecer.
    function tentarMontarLista() {

        if (listaMontada) {
            return;
        }

        let ids = [];

        try {
            ids = player.getPlaylist() || [];
        } catch (erro) {
            ids = [];
        }

        if (ids.length > 0) {
            idsVideos = ids;
            montarLista();
            return;
        }

        tentativasLista += 1;

        if (tentativasLista <= 20) {
            setTimeout(tentarMontarLista, 500);
        } else {
            mostrarMensagemLista(
                "Não foi possível listar os vídeos. " +
                "Use o menu de playlist dentro do player."
            );
        }
    }


    // ---------------------------------------------------------
    // Player do YouTube
    // ---------------------------------------------------------

    function aoMudarEstado(evento) {

        if (!listaMontada) {
            tentarMontarLista();
        }

        const estado = evento.data;

        if (estado === 1) { // tocando
            destacarAtual();
            iniciarTimer();

            // ajuda a preencher o título do vídeo atual se a busca falhou
            try {
                const dados = player.getVideoData();
                if (dados && dados.video_id && dados.title) {
                    definirTituloDoVideo(dados.video_id, dados.title);
                }
            } catch (erro) { /* ignora */ }

        } else if (estado === 0) { // terminou
            pararTimer();
            marcarAtualComoAssistido();

        } else {
            pararTimer();
        }
    }

    function aoPlayerPronto() {
        tentarMontarLista();
    }

    function criarPlayer(codigoPlaylist) {

        moldura.innerHTML = "";

        const alvo = document.createElement("div");
        alvo.id = "ytPlayer";
        moldura.appendChild(alvo);

        player = new YT.Player("ytPlayer", {
            width: "100%",
            height: "100%",
            playerVars: {
                listType: "playlist",
                list: codigoPlaylist,
                rel: 0,
                playsinline: 1
            },
            events: {
                onReady: aoPlayerPronto,
                onStateChange: aoMudarEstado
            }
        });

        dica.hidden = false;
    }

    // Plano B: se a API do YouTube não carregar, mostra o player simples
    function criarPlayerSimples(codigoPlaylist, nomeTrilha) {

        const iframe = document.createElement("iframe");
        iframe.src =
            "https://www.youtube.com/embed/videoseries?list=" +
            encodeURIComponent(codigoPlaylist) +
            "&rel=0&playsinline=1";
        iframe.title = "Playlist: " + nomeTrilha;
        iframe.allow =
            "accelerometer; autoplay; encrypted-media; picture-in-picture; web-share";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        iframe.allowFullscreen = true;

        moldura.innerHTML = "";
        moldura.appendChild(iframe);

        mostrarMensagemLista(
            "Não foi possível carregar a lista de vídeos. " +
            "Use o menu de playlist dentro do player."
        );
    }

    function carregarApiYouTube() {
        return new Promise(function (resolve, reject) {

            if (window.YT && window.YT.Player) {
                resolve();
                return;
            }

            const anterior = window.onYouTubeIframeAPIReady;

            window.onYouTubeIframeAPIReady = function () {
                if (typeof anterior === "function") {
                    anterior();
                }
                resolve();
            };

            const script = document.createElement("script");
            script.src = "https://www.youtube.com/iframe_api";
            script.onerror = function () {
                reject(new Error("API do YouTube indisponível"));
            };
            document.head.appendChild(script);

            setTimeout(function () {
                reject(new Error("Tempo esgotado ao carregar a API do YouTube"));
            }, 10000);
        });
    }


    // ---------------------------------------------------------
    // Início
    // ---------------------------------------------------------

    idTrilha = new URLSearchParams(window.location.search).get("id");

    if (!idTrilha || !/^\d+$/.test(idTrilha)) {
        mostrarErro("Trilha inválida. Volte para a página de cursos e escolha uma trilha.");
        return;
    }

    try {

        const resposta = await fetch(
            API_BASE_URL + "/cursos/trilha?id_trilha=" + encodeURIComponent(idTrilha)
        );
        const dados = await resposta.json();

        if (!resposta.ok || !dados.success) {
            throw new Error(dados.message || "Erro ao buscar a trilha");
        }

        const trilha = dados.trilha;

        document.title = trilha.titulo_trilha + " - Accuracy";
        titulo.textContent = trilha.titulo_trilha;
        descricao.textContent = trilha.descricao_trilha || "";

        // só aceita letras, números, _ e - no código da playlist
        if (!/^[A-Za-z0-9_-]+$/.test(trilha.playlist_youtube_trilha || "")) {
            mostrarErro("Esta trilha ainda não tem uma playlist cadastrada.");
            return;
        }

        totalNoBanco = Number(trilha.total_videos_trilha) || 0;

        if (window.AccuracyProgresso) {
            assistidos = window.AccuracyProgresso.ler(idTrilha);
        }

        atualizarProgresso();

        try {
            await carregarApiYouTube();
            criarPlayer(trilha.playlist_youtube_trilha);
        } catch (erroApi) {
            console.error("API do YouTube:", erroApi);
            criarPlayerSimples(trilha.playlist_youtube_trilha, trilha.titulo_trilha);
        }

    } catch (erro) {

        console.error("Erro ao carregar a trilha:", erro);
        mostrarErro("Não foi possível carregar a trilha. Tente novamente em instantes.");

    }
});
