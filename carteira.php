<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Carteira - Accuracy</title>

    <link rel="stylesheet" href="css/Tema.css">
    <link rel="stylesheet" href="css/carteira.css">
    <link rel="stylesheet" href="css/carteiras.css">

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >

    <script src="js/Tema.js"></script>
    <script src="js/avatar-global.js"></script>
</head>

<body>

<div class="app">

    <aside class="sidebar">

        <div class="top">

            <a href="dashboard.php" class="logo">
                <div class="logo-box">
                    <i class="bi bi-graph-up"></i>
                </div>

                <span>Accuracy</span>
            </a>

            <div class="divider"></div>

            <nav class="menu">

                <a href="dashboard.php">
                    <i class="bi bi-grid-1x2-fill"></i>
                    <span>Dashboard</span>
                </a>

                <a href="carteira.php" class="active">
                    <i class="bi bi-wallet2"></i>
                    <span>Carteira</span>
                </a>

                <a href="historico.php">
                    <i class="bi bi-clock-history"></i>
                    <span>Histórico</span>
                </a>

                <a href="aportes.php">
                    <i class="bi bi-plus-circle"></i>
                    <span>Aportes</span>
                </a>

                <a href="#">
                    <i class="bi bi-bar-chart-line"></i>
                    <span>Relatórios</span>
                </a>

                <a href="Cursos.php">
                    <i class="bi bi-mortarboard"></i>
                    <span>Cursos</span>
                </a>

                <a href="perfil.php">
                    <i class="bi bi-person"></i>
                    <span>Perfil</span>
                </a>

            </nav>

        </div>


        <!-- =========================
             ÁREA DO USUÁRIO
        ========================== -->

        <div class="user-area">


            <!-- NOTIFICAÇÕES -->

            <div class="icons">

                <div class="notification-container">

                    <button
                        class="notification-btn"
                        id="notificationBtn"
                        type="button"
                        aria-label="Notificações"
                    >
                        <i class="bi bi-bell"></i>
                        <span
                            class="notification-dot"
                            id="notificationDot"
                        ></span>
                    </button>

                    <div
                        class="notification-panel"
                        id="notificationPanel"
                    >

                        <div class="notification-header">
                            <h3>Notificações</h3>

                            <button
                                id="markRead"
                                type="button"
                            >
                                Marcar como lidas
                            </button>
                        </div>

                        <div class="notification-list">

                            <div class="empty-notifications">
                                <i class="bi bi-bell-slash"></i>
                                <strong>Nenhuma notificação</strong>
                                <p>Você não possui novas notificações.</p>
                            </div>

                        </div>

                        <div class="notification-footer">
                            <a href="historico.php">
                                Ver todas as notificações
                            </a>
                        </div>

                    </div>

                </div>

            </div>


            <div class="user">
                <a href="perfil.php">
                    <div class="avatar">N</div>
                </a>

                <div class="user-info">
                    <a href="perfil.php">
                        <strong>Nome da pessoa</strong>
                    </a>

                    <p>Perfil do usuário</p>
                </div>
            </div>

        </div>

    </aside>

    <main class="main">

        <header class="topbar">

            <div>
                <h1>Carteira</h1>
                <p id="currentDate">Quinta-feira, 18 de junho de 2026</p>
            </div>

        </header>


        <!-- =========================
             CARTEIRAS
        ========================== -->

        <section class="wallet-bar">

            <div class="wallet-tabs" id="walletTabs"></div>

            <div class="wallet-actions">

                <button
                    class="wallet-btn danger"
                    id="deleteWalletBtn"
                    type="button"
                    hidden
                >
                    <i class="bi bi-trash"></i>
                    Excluir carteira
                </button>

                <button
                    class="wallet-btn primary"
                    id="newWalletBtn"
                    type="button"
                >
                    <i class="bi bi-plus-lg"></i>
                    Nova carteira
                </button>

            </div>

        </section>


        <section class="cards">

            <div class="card highlight">
                <h3>PATRIMÔNIO TOTAL</h3>
                <p id="totalEquity">R$ 0,00</p>
                <span id="equityHint">Soma dos aportes</span>
            </div>

            <div class="card">
                <h3>TOTAL INVESTIDO</h3>
                <p id="totalInvested">R$ 0,00</p>
                <span>Atualizado pelos aportes</span>
            </div>

            <div class="card">
                <h3>RENDIMENTO TOTAL</h3>
                <p class="green">R$ 0,00</p>
                <span>Em breve</span>
            </div>

        </section>

        <section class="content">

            <div class="table-container">

                <div class="table-header">
                    <h3>Investimentos ativos</h3>
                    <span class="badge" id="assetsCount">0 ativos</span>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ATIVO</th>
                            <th>CLASSE</th>
                            <th>APORTES</th>
                            <th>VALOR TOTAL</th>
                            <th>PARTICIPAÇÃO</th>
                        </tr>
                    </thead>

                    <tbody id="assetsBody"></tbody>
                </table>

            </div>

            <div class="chart">
                <h3>Distribuição</h3>

                <div class="circle" id="distributionChart"></div>

                <div class="legend" id="distributionLegend"></div>
            </div>

        </section>

    </main>

</div>

<script>
const notificationBtn = document.getElementById("notificationBtn");
const notificationPanel = document.getElementById("notificationPanel");
const notificationDot = document.getElementById("notificationDot");
const markRead = document.getElementById("markRead");

notificationBtn.addEventListener("click", function (event) {
    event.stopPropagation();
    notificationPanel.classList.toggle("show");
});

notificationPanel.addEventListener("click", function (event) {
    event.stopPropagation();
});

document.addEventListener("click", function () {
    notificationPanel.classList.remove("show");
});

markRead.addEventListener("click", function () {

    const unreadItems = document.querySelectorAll(".notification-item.unread");

    unreadItems.forEach(function (item) {

        item.classList.remove("unread");

        const unreadDot = item.querySelector(".unread-dot");

        if (unreadDot) {
            unreadDot.remove();
        }

    });

    notificationDot.style.display = "none";
});
</script>

<script src="js/carteiras.js"></script>
<script src="js/carteira.js?v=2"></script>

</body>
</html>