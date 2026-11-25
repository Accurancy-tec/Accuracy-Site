// =========================================================
// PÁGINA DE UMA TRILHA
// Lê o id na URL (trilha.php?id=1), busca a trilha na API,
// mostra o player da playlist do YouTube e, ao lado, a lista
// com todos os vídeos. Também guarda quais vídeos o aluno já
// assistiu e mostra a barra de progresso.
// =========================================================

document.addEventListener("DOMContentLoaded", async function () {

    const API_BASE_URL = window.ACCURACY_API_URL;

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
    let timerProgresso = null;
    let assistidos = [];
    const P = window.AccuracyProgresso;
    let selecionado = null;
    let ultimo = null;
    let carregandoVideo = false;
    let falha = false;
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.className = "player-hint";
    boxProgresso.insertAdjacentElement("afterend", status);

    function mensagem(texto) { status.textContent = texto; }

    function capturar() {
        if (!player || carregandoVideo || falha) return null;
        try {
            const d = player.getVideoData();
            const tempo = player.getCurrentTime(), duracao = player.getDuration();
            if (!d || d.video_id !== selecionado || !Number.isFinite(tempo) || !(duracao > 0)) return null;
            if (tempo <= 0 && !ultimo) return null;
            ultimo = {video: selecionado, tempo: Math.floor(tempo), pct: Math.min(100, Math.floor(100 * tempo / duracao))};
            return ultimo;
        } catch (_) { return null; }
    }

    function gravar(amostra, keepalive = false) {
        if (!amostra) return Promise.resolve();
        return P.salvar(idTrilha, amostra.video, amostra.pct, amostra.tempo, keepalive).then(function () {
            assistidos = P.ler(idTrilha);
            atualizarMarcas();
            atualizarProgresso();
            if (!falha) mensagem("Progresso salvo na sua conta.");
        }).catch(function (erro) {
            console.error("Erro ao salvar progresso:", erro);
            mensagem("Não foi possível salvar o progresso. Aguarde ou tente novamente ao reproduzir.");
        });
    }

    function trocarVideo(indice, jaSalvou = false) {
        if (indice < 0 || indice >= idsVideos.length || !player) return;
        if (!jaSalvou) gravar(capturar() || ultimo);
        pararTimer();
        ultimo = null;
        carregandoVideo = true;
        falha = false;
        indiceAtual = indice;
        selecionado = idsVideos[indice];
        const item = P.atual(idTrilha, selecionado);
        const inicio = item && !item.concluido_progresso ? Number(item.ultima_posicao_segundos) || 0 : 0;
        player.loadVideoById({videoId: selecionado, startSeconds: inicio});
        destacarAtual();
    }

    document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "hidden") gravar(capturar() || ultimo, true);
    });
    window.addEventListener("pagehide", function () { gravar(capturar() || ultimo, true); });


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

    // Salva a posição a cada 15 segundos de reprodução.
    function iniciarTimer() {
        pararTimer();
        timerProgresso = setInterval(function () { gravar(capturar()); }, 15000);
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

    function destacarAtual() {

        const indice = indiceAtual;
        if (indice < 0 || indice >= botoes.length) return;

        botoes.forEach(function (botao, i) {
            botao.classList.toggle("active", i === indice);
        });

        // rola só a lista (não a página) para o vídeo atual ficar visível
        const botao = botoes[indice];
        const topo = botao.offsetTop - (lista.clientHeight - botao.clientHeight) / 2;
        lista.scrollTo({ top: Math.max(0, topo), behavior: "smooth" });
    }

    function montarLista() {

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
            nome.textContent = P.atual(idTrilha, idVideo).titulo_curso || "Vídeo " + (i + 1);

            const check = document.createElement("i");
            check.className = "bi bi-check-circle-fill playlist-check";
            check.setAttribute("title", "Assistido");

            botao.appendChild(numero);
            botao.appendChild(miniatura);
            botao.appendChild(nome);
            botao.appendChild(check);

            botao.addEventListener("click", function () {
                try {
                    trocarVideo(i);
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

    }

    // O player usa exclusivamente os vídeos válidos cadastrados no banco.
    function aoMudarEstado(evento) {
        const estado = evento.data;
        if (estado === 1) {
            try {
                if (player.getVideoData().video_id !== selecionado) return;
            } catch (_) { return; }
            carregandoVideo = false;
            falha = false;
            iniciarTimer();
        } else if (estado === 0 && !carregandoVideo && !falha) {
            pararTimer();
            const amostra = capturar() || ultimo;
            if (amostra && amostra.video === selecionado) {
                gravar({...amostra, pct: 100});
                ultimo = null;
            }
            if (indiceAtual + 1 < idsVideos.length) trocarVideo(indiceAtual + 1, true);
        } else {
            pararTimer();
            if (estado === 2) gravar(capturar());
        }
    }

    function aoPlayerPronto() {
        montarLista();
        dica.hidden = false;
    }

    function criarPlayer() {
        moldura.innerHTML = "";
        const alvo = document.createElement("div");
        alvo.id = "ytPlayer";
        moldura.appendChild(alvo);
        const item = P.retomar(idTrilha);
        indiceAtual = Math.max(0, idsVideos.indexOf(item.video));
        selecionado = idsVideos[indiceAtual];
        carregandoVideo = true;
        player = new YT.Player("ytPlayer", {
            width: "100%", height: "100%", videoId: selecionado,
            playerVars: { rel: 0, playsinline: 1, start: item.concluido_progresso ? 0 : Number(item.ultima_posicao_segundos) || 0 },
            events: {
                onReady: aoPlayerPronto,
                onStateChange: aoMudarEstado,
                onError: function () {
                    pararTimer();
                    falha = true;
                    mensagem("Este vídeo está indisponível. Selecione outra aula na lista.");
                }
            }
        });
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

        await P.carregar();
        idsVideos = P.lista(idTrilha).map(item => item.video);
        totalNoBanco = idsVideos.length;
        if (!idsVideos.length) {
            mostrarErro("Esta trilha ainda não tem aulas cadastradas.");
            return;
        }
        assistidos = P.ler(idTrilha);
        atualizarProgresso();
        await carregarApiYouTube();
        criarPlayer();

    } catch (erro) {

        console.error("Erro ao carregar a trilha:", erro);
        mostrarErro("Não foi possível carregar a trilha. Tente novamente em instantes.");

    }
});
