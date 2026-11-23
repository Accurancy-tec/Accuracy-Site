<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Histórico - Accuracy</title>

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/dashboard.css">

    <link rel="stylesheet" href="css/historico-v2.css">

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

<body class="v2" data-v2-search="local">

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
                <a href="historico.php" class="active">Histórico</a>
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
                <div class="v2-total"><span>Saldo disponivel</span> <strong id="v2Total">—</strong></div>

                <a href="perfil.php" aria-label="Perfil">
                    <div class="avatar">U</div>
                </a>
            </div>

        </header>


        <main class="v2-content">

            <div class="v2-page-head">

                <div>
                    <h1>Histórico</h1>
                    <p>Movimentações da sua conta</p>
                </div>

                <div class="v2-head-actions">
                    <button type="button" class="v2-btn" data-v2-saldo="adicionar">Adicionar saldo</button>
                    <button type="button" class="v2-btn-outline" data-v2-saldo="retirar">Retirar</button>
                </div>

            </div>


            <!-- RESUMO -->

            <section class="v2-stats">

                <div class="v2-stat">
                    <span>Total aportado</span>
                    <strong id="cardTotal">R$ 0,00</strong>
                </div>

                <div class="v2-stat green">
                    <span>Aportes realizados</span>
                    <strong id="cardAdded">+R$ 0,00</strong>
                </div>

                <div class="v2-stat red">
                    <span>Aportes removidos</span>
                    <strong id="cardRemoved">R$ 0,00</strong>
                </div>

                <!-- usados pelo Historico.js; não aparecem no layout -->
                <div hidden>
                    <span id="cardTotalInfo"></span>
                    <span id="cardAddedInfo"></span>
                    <span id="cardRemovedInfo"></span>
                    <span id="cardMoves"></span>
                    <span id="cardMovesInfo"></span>
                </div>

            </section>


            <!-- TRANSAÇÕES -->

            <section class="v2-panel">

                <div class="v2-pills" style="margin-bottom: 4px;">
                    <button type="button" class="active" data-filter="all">Tudo</button>
                    <button type="button" data-filter="Compra">Compra</button>
                    <button type="button" data-filter="Aporte">Aporte</button>
                    <button type="button" data-filter="removed">Removidos</button>
                </div>

                <div class="v2-table-wrap">
                    <table class="v2-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th class="num">Valor</th>
                            </tr>
                        </thead>

                        <tbody id="historyBody">
                            <tr><td colspan="4" class="v2-empty">Carregando histórico...</td></tr>
                        </tbody>
                    </table>
                </div>

            </section>


            <!-- GRÁFICO -->

            <section class="v2-panel v2-pad-b">

                <div class="v2-panel-head">
                    <h2>Aportes por mês</h2>

                    <div class="chart-legend">
                        <span><i class="dot dot-green"></i>Aportado</span>
                        <span><i class="dot dot-red"></i>Removido</span>
                    </div>
                </div>

                <div class="chart-box" id="chartBox">Gráfico</div>

            </section>

        </main>

    </div>

</div>


<script src="js/cotacoes.js?v=3"></script>
<script src="js/resumoCarteiras.js?v=2"></script>
<script src="js/shell-v2.js?v=21"></script>
<script src="js/Historico.js?v=2"></script>

</body>
</html>
