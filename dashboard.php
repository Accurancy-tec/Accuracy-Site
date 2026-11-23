<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dashboard - Accuracy</title>

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/base-v2.css">

    <link rel="stylesheet" href="css/Loading.css">
    <link rel="stylesheet" href="css/dashboard-v2.css">

    <!-- Novo layout (sidebar, topo, cartões e tabelas) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">

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
                <a href="dashboard.php" class="active">Início</a>
                <a href="carteira.php">Carteira</a>
                <a href="aportes.php">Aportes</a>
                <a href="historico.php">Histórico</a>
                <a href="Cursos.php">Cursos</a>
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
                    <div class="v2-total"><span>Total</span> <strong id="v2Total">—</strong></div>

                    <a href="perfil.php" aria-label="Perfil">
                        <div class="avatar">U</div>
                    </a>
                </div>

            </header>


            <main class="v2-content">

                <div class="v2-page-head">
                    <div>
                        <h1>Olá, <span id="nomeUsuario">Usuário</span></h1>
                        <p>Resumo do seu patrimônio hoje.</p>
                    </div>
                </div>

                <!-- RESUMO PRINCIPAL + ATIVOS EM DESTAQUE -->
                <section class="dashboard-overview">
                    <section class="card-big">
                        <div>
                            <span class="card-label">SALDO TOTAL DA CARTEIRA</span>
                            <h2>R$ 0,00</h2>
                            <div class="stats">
                                <div>
                                    <p>Total investido</p>
                                    <strong>R$ 0,00</strong>
                                </div>
                                <div>
                                    <p>Saldo livre</p>
                                    <strong>R$ 0,00</strong>
                                </div>
                                <div>
                                    <p>Rendimento</p>
                                    <strong class="green">R$ 0,00</strong>
                                </div>
                            </div>
                        </div>
                        <div class="badge">—</div>
                    </section>

                    <section class="featured-assets" aria-labelledby="featuredAssetsTitle">
                        <h2 id="featuredAssetsTitle">Ativos em destaque</h2>
                        <div class="featured-assets-empty">
                            <i class="bi bi-bar-chart-line" aria-hidden="true"></i>
                            <p>Seus ativos aparecerão aqui quando houver dados disponíveis.</p>
                        </div>
                    </section>
                </section>

                <div class="dashboard-lower">
                    <!-- DISTRIBUIÇÃO DA CARTEIRA (valores calculados com os dados reais) -->
                    <section class="distribution-section">
                        <div class="dashboard-section-heading">
                            <h2>Distribuição da carteira</h2>
                            <span>Composição dos seus investimentos</span>
                        </div>
                        <section class="grid">

                            <div class="card">
                                <div class="card-icon"><i class="bi bi-shield-check"></i></div>
                                <h4>Renda fixa</h4>
                                <p>R$ 0</p>
                                <span class="green">—</span>
                            </div>

                            <div class="card">
                                <div class="card-icon"><i class="bi bi-graph-up-arrow"></i></div>
                                <h4>Renda variável</h4>
                                <p>R$ 0</p>
                                <span class="green">—</span>
                            </div>

                            <div class="card">
                                <div class="card-icon"><i class="bi bi-currency-bitcoin"></i></div>
                                <h4>Cripto</h4>
                                <p>R$ 0</p>
                                <span class="green">—</span>
                            </div>

                            <div class="card">
                                <div class="card-icon"><i class="bi bi-globe2"></i></div>
                                <h4>Outros</h4>
                                <p>R$ 0</p>
                                <span class="green">—</span>
                            </div>

                        </section>
                    </section>

                    <!-- NOTÍCIAS NO ESPAÇO DAS ÚLTIMAS MOVIMENTAÇÕES -->
                    <section class="v2-news" id="v2News" aria-label="Notícias do mercado">
                        <div class="v2-news-head">
                            <div>
                                <h2><i class="bi bi-newspaper" aria-hidden="true"></i> Notícias do mercado</h2>
                                <p>Informações sobre investimentos, economia e mercado financeiro.</p>
                            </div>
                        </div>

                        <div class="v2-carousel" id="v2Carousel" tabindex="0"
                            role="region" aria-roledescription="carrossel" aria-label="Notícias do mercado" hidden>
                            <div class="v2-slides" id="v2Slides"></div>
                            <button type="button" class="v2-car-btn prev" aria-label="Notícia anterior">&#8249;</button>
                            <button type="button" class="v2-car-btn next" aria-label="Próxima notícia">&#8250;</button>
                            <div class="v2-dots" id="v2Dots"></div>
                        </div>

                        <div class="v2-carousel v2-news-vazio" id="v2NewsEmpty">
                            <i class="bi bi-megaphone" aria-hidden="true"></i>
                            <div>
                                <strong>Em breve: notícias e novidades do mercado financeiro.</strong>
                                <p>Assim que houver notícias publicadas, elas aparecerão aqui.</p>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- GRÁFICO -->
                <section class="chart">

                    <div class="chart-header">
                        <div>
                            <h3>Evolução da carteira</h3>
                            <p>Acompanhe o crescimento dos seus investimentos</p>
                        </div>

                        <button type="button" class="chart-filter">
                            Últimos 6 meses
                            <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>

                    <div class="chart-box">
                        <div class="chart-placeholder">
                            <i class="bi bi-bar-chart-line"></i>
                            <span>Gráfico da evolução da carteira</span>
                        </div>
                    </div>

                </section>

            </main>

        </div>

    </div>


    <script src="js/cotacoes.js?v=3"></script>
    <script src="js/resumoCarteiras.js?v=2"></script>
    <script src="js/shell-v2.js?v=20"></script>
    <script src="js/Loading.js"></script>
    <script src="js/dashboard-extra.js"></script>
    <script src="js/dashboard-total.js"></script>
    <script src="js/Dashboard-animacoes.js"></script>
    <script src="js/noticias.js?v=1"></script>

</body>

</html>