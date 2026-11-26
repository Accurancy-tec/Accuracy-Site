<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <?php
    $tituloPagina = "Trilha";
    $estilosPagina = ["css/dashboard.css?v=2", "css/cursos-v2.css?v=5", "css/trilha.css?v=2"];
    include __DIR__ . "/includes/head-app.php";
    ?>
</head>

<body class="v2">

<div class="v2-app">

    <?php $paginaAtual = "cursos"; include __DIR__ . "/includes/menu-app.php"; ?>


        <main class="v2-content">

            <div class="v2-page-head">
                <div>
                    <a href="Cursos.php" class="back-link">
                        <i class="bi bi-arrow-left"></i>
                        Voltar aos cursos
                    </a>
                    <h1 id="trilhaTitulo">Carregando...</h1>
                    <p id="trilhaDescricao"></p>
                </div>
            </div>

            <div class="trilha-layout">

                <section class="trilha-player">

                    <div class="player-frame" id="playerFrame">
                        <p class="trilhas-status">Carregando playlist...</p>
                    </div>

                    <div class="trilha-prog trilha-prog-lg" id="trilhaProgresso" hidden>
                        <div class="trilha-prog-barra" id="trilhaProgressoBarra" role="progressbar"
                             aria-label="Vídeos assistidos" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
                            <div class="trilha-prog-fill" id="trilhaProgressoFill"></div>
                        </div>
                        <span class="trilha-prog-rotulo" id="trilhaProgressoTexto"></span>
                    </div>

                    <p class="player-hint" id="playerHint" hidden>
                        <i class="bi bi-info-circle"></i>
                        Clique em um vídeo da lista para assistir.
                        Os vídeos que você terminar ficam marcados.
                    </p>

                </section>

                <aside class="playlist-panel" aria-label="Vídeos da trilha">
                    <div class="playlist-inner">
                        <div class="playlist-head">
                            <span>Vídeos da trilha</span>
                            <span class="playlist-count" id="playlistContagem"></span>
                        </div>
                        <ol class="playlist-list" id="playlistLista">
                            <li class="playlist-status">Carregando vídeos...</li>
                        </ol>
                    </div>
                </aside>

            </div>

        </main>

    </div>

</div>


<?php include __DIR__ . "/includes/scripts-app.php"; ?>
<script src="js/progresso.js?v=20261125"></script>
<script src="js/trilha.js?v=20261125"></script>
</body>
</html>
