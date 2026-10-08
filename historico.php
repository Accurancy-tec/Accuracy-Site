<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Histórico - Accuracy</title>

<link rel="stylesheet" href="css/Tema.css">
<link rel="stylesheet" href="css/historico.css?v=3">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
<script src="js/Tema.js"></script>
<script src="js/avatar-global.js"></script>
<script src="js/auth.js?v=1"></script>
<script src="js/usuario-global.js"></script>
</head>

<body>

<div class="app">

    <!-- =========================
         NAVBAR SUPERIOR
    ========================== -->

    <aside class="sidebar">

        <div class="top">

            <!-- LOGO -->

            <a href="dashboard.php" class="logo">

                <div class="logo-box">
                    <i class="bi bi-graph-up"></i>
                </div>

                <span>Accuracy</span>

            </a>


            <!-- DIVISOR -->

            <div class="divider"></div>


            <!-- MENU -->

            <nav class="menu">

                <a href="dashboard.php">
                    <i class="bi bi-grid"></i>
                    <span>Dashboard</span>
                </a>

                <a href="carteira.php">
                    <i class="bi bi-wallet2"></i>
                    <span>Carteira</span>
                </a>

                <a href="historico.php" class="active">
                    <i class="bi bi-clock-history"></i>
                    <span>Histórico</span>
                </a>

                <a href="aportes.php">
                    <i class="bi bi-plus-circle"></i>
                    <span>Aportes</span>
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
                        type="button"
                        aria-label="Notificações"
                        id="notificationBtn"
                    >

                        <i class="bi bi-bell"></i>

                        <span
                            class="notification-dot"
                            id="notificationDot"
                        ></span>

                    </button>


                    <!-- =========================
                         PAINEL DE NOTIFICAÇÕES
                    ========================== -->

                    <div
                        class="notification-panel"
                        id="notificationPanel"
                    >

                        <!-- CABEÇALHO -->

                        <div class="notification-header">

                            <h3>Notificações</h3>

                            <button
                                type="button"
                                id="markRead"
                            >
                                Marcar como lidas
                            </button>

                        </div>


                        <!-- LISTA -->

                        <div class="notification-list">

                            <div class="empty-notifications">
                                <i class="bi bi-bell-slash"></i>
                                <strong>Nenhuma notificação</strong>
                                <p>Você não possui novas notificações.</p>
                            </div>

                        </div>


                        <!-- RODAPÉ -->

                        <div class="notification-footer">

                            <a href="historico.php">
                                Ver todas as notificações
                            </a>

                        </div>

                    </div>

                </div>

            </div>


            <!-- =========================
                 USUÁRIO
            ========================== -->

            <div class="user">

                <a href="perfil.php">

                    <div class="avatar">
                        N
                    </div>

                </a>

                <div class="user-info">

                    <a href="perfil.php">

                        <strong>
                            Nome da pessoa
                        </strong>

                    </a>

                    <p>
                        Perfil do usuário
                    </p>

                </div>

            </div>

        </div>

    </aside>


    <!-- MAIN -->
    <main class="main">

        <header class="topbar">
            <div>
                <h1>Histórico</h1>
                <p id="currentDate"></p>
            </div>
        </header>

        <section class="cards">
            <div class="card">
                <span>Total aportado</span>
                <h3 id="cardTotal">R$ 0,00</h3>
                <p id="cardTotalInfo">0 aportes ativos</p>
            </div>

            <div class="card green">
                <span>Aportes realizados</span>
                <h3 id="cardAdded">R$ 0,00</h3>
                <p id="cardAddedInfo">0 operações</p>
            </div>

            <div class="card red">
                <span>Aportes removidos</span>
                <h3 id="cardRemoved">R$ 0,00</h3>
                <p id="cardRemovedInfo">0 remoções</p>
            </div>

            <div class="card">
                <span>Movimentações</span>
                <h3 id="cardMoves">0</h3>
                <p id="cardMovesInfo">Nenhuma ainda</p>
            </div>
        </section>

        <section class="chart">
            <div class="chart-header">
                <h3>Aportes por mês</h3>

                <div class="chart-legend">
                    <span><i class="dot dot-green"></i>Aportado</span>
                    <span><i class="dot dot-red"></i>Removido</span>
                </div>
            </div>

            <div class="chart-box" id="chartBox">Gráfico</div>
        </section>

        <section class="table">

            <div class="table-header">
                <h3>Transações</h3>

                <div class="filters">
                    <button class="active" data-filter="all">Todos</button>
                    <button data-filter="Compra">Compra</button>
                    <button data-filter="Aporte">Aporte</button>
                    <button data-filter="removed">Removidos</button>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th>Tipo</th>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Recorrência</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody id="historyBody"></tbody>
            </table>

        </section>

    </main>

</div>


<!-- =========================
     JAVASCRIPT
========================= -->

<script src="js/Historico.js?v=1"></script>

<script>

    /* =========================
       ELEMENTOS
    ========================== */

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const notificationDot =
        document.getElementById("notificationDot");

    const markRead =
        document.getElementById("markRead");


    /* =========================
       ABRIR / FECHAR PAINEL
    ========================== */

    notificationBtn.addEventListener("click", function(event) {

        event.stopPropagation();

        notificationPanel.classList.toggle("show");

    });


    /* =========================
       NÃO FECHAR AO CLICAR
       DENTRO DO PAINEL
    ========================== */

    notificationPanel.addEventListener("click", function(event) {

        event.stopPropagation();

    });


    /* =========================
       FECHAR AO CLICAR FORA
    ========================== */

    document.addEventListener("click", function() {

        notificationPanel.classList.remove("show");

    });


    /* =========================
       MARCAR COMO LIDAS
    ========================== */

    markRead.addEventListener("click", function() {

        const unreadItems =
            document.querySelectorAll(
                ".notification-item.unread"
            );


        unreadItems.forEach(function(item) {

            item.classList.remove("unread");


            const unreadDot =
                item.querySelector(".unread-dot");


            if (unreadDot) {

                unreadDot.remove();

            }

        });


        /* Remove a bolinha verde do sino */

        notificationDot.style.display = "none";

    });

</script>


</body>
</html>