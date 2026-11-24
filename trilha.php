<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Trilha - Accuracy</title>

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/dashboard.css">

    <link rel="stylesheet" href="css/cursos-v2.css?v=4">

    <!-- Novo layout (sidebar, topo, cartões e tabelas) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">
    <link rel="stylesheet" href="css/trilha.css">

    <script src="js/usuario-global.js"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
        rel="stylesheet">

    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

    <script src="js/Tema.js"></script>
    <script src="js/avatar-global.js"></script>
</head>

<body class="v2">

<div class="v2-app">

    <!-- =========================
         SIDEBAR
    ========================== -->

    <aside class="v2-sidebar">

        <a href="dashboard.php" class="v2-logo">Accuracy</a>

        <nav class="v2-nav">
                <a href="dashboard.php">Início</a>
                <a href="carteira.php">Carteira</a>
                <a href="aportes.php">Aportes</a>
                <a href="historico.php">Histórico</a>
                <a href="Cursos.php" class="active">Cursos</a>
                <a href="perfil.php">Perfil</a>
        </nav>

        <div class="v2-balance">
            <span>Saldo disponível</span>
            <strong id="v2Saldo">—</strong>
            <button type="button" id="v2AddSaldo">Adicionar saldo</button>
        </div>

    </aside>


    <div class="v2-main">

        <!-- =========================
             TOPO
        ========================== -->

        <header class="v2-topbar">

            <div class="v2-search">
                <input type="text"
                       id="v2Search"
                       placeholder="Buscar empresa ou código do ativo"
                       autocomplete="off"
                       aria-label="Buscar empresa ou código do ativo">
            </div>

            <div class="v2-topbar-right">
                <div class="v2-total"><span>Saldo disponivel</span> <strong id="v2Total">—</strong></div>

                <a href="perfil.php" aria-label="Perfil">
                    <div class="avatar">U</div>
                </a>
            </div>

        </header>


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

<script src="js/cotacoes.js?v=12"></script>
<script src="js/resumoCarteiras.js?v=2"></script>
<script src="js/shell-v2.js?v=21"></script>
<script src="js/progresso.js"></script>
<script src="js/trilha.js"></script>

</body>
</html>
