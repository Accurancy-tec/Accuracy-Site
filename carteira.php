<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <!-- ACC_PERF_CARTEIRAS_V1: antecipa conexao com a API -->
    <link rel="preconnect" href="https://accuracyappapi.onrender.com" crossorigin>
    <link rel="dns-prefetch" href="//accuracyappapi.onrender.com">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Carteira - Accuracy</title>

    <!-- Tema (precisa vir antes de tudo) -->
    <link rel="stylesheet" href="css/Tema.css">

    <!-- Base do site (reset, avatar) -->
    <link rel="stylesheet" href="css/dashboard.css">

    <!-- Janelas de criar carteira -->
    <link rel="stylesheet" href="css/carteiras.css?v=2">

    <!-- Novo layout (sidebar, topo, cartões e tabela) -->
    <link rel="stylesheet" href="css/layout-v2.css?v=4">

    <script src="js/usuario-global.js"></script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Manrope:wght@600;700;800&display=swap"
        rel="stylesheet">

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
            <a href="carteira.php" class="active">Carteira</a>
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
                <div class="v2-total"><span>Saldo disponivel</span> <strong id="v2Total">—</strong></div>

                <a href="perfil.php" aria-label="Perfil">
                    <div class="avatar">U</div>
                </a>
            </div>

        </header>


        <main class="v2-content">

            <div class="v2-page-head">

                <div>
                    <h1>Carteiras</h1>
                    <p id="v2Sub">Carregando suas carteiras…</p>
                </div>

                <button type="button" class="v2-btn" id="v2CreateBtn">Criar carteira</button>

            </div>


            <!-- CARTEIRAS -->

            <section class="v2-wallets" id="v2Wallets" aria-label="Minhas carteiras">
                <div class="v2-wallet-skeleton"></div>
                <div class="v2-wallet-skeleton"></div>
                <div class="v2-wallet-skeleton"></div>
            </section>


            <!-- ATIVOS DA CARTEIRA SELECIONADA -->

            <section class="v2-panel">

                <div class="v2-panel-head">
                    <h2 id="v2TableTitle">Aportes na carteira</h2>

                    <button type="button" class="v2-ghost-danger" id="v2DeleteBtn" hidden>
                        Excluir carteira
                    </button>
                </div>

                <div class="v2-table-wrap">
                    <table class="v2-table">
                        <thead>
                            <tr>
                                <th>Ativo</th>
                                <th class="num">Qtd.</th>
                                <th class="num">Preço médio</th>
                                <th class="num">Posição</th>
                                <th class="num">Rentab.</th>
                            </tr>
                        </thead>

                        <tbody id="v2Body">
                            <tr><td colspan="5" class="v2-empty">Carregando…</td></tr>
                        </tbody>
                    </table>
                </div>

            </section>

        </main>

    </div>

</div>

<script src="js/accuracy-carteiras-perf.js?v=1"></script><script src="js/carteiras.js?v=20261124191750"></script>
<script src="js/cotacoes.js?v=4"></script>
<script src="js/resumoCarteiras.js?v=4"></script>
<script src="js/accuracy-saldos-rapidos.js?v=1"></script>
<script src="js/shell-v2.js?v=24"></script>
<script src="js/carteira-v2.js?v=3"></script>
<link rel="stylesheet" href="css/carteira-venda.css?v=1">
<script src="js/carteira-venda.js?v=5"></script>

</body>
</html>
