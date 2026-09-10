<?php
session_start();
include('configs/conexao.php');

if(!isset($_SESSION["nome"])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Dashboard - Accuracy</title>

    <link rel="stylesheet" href="css/dashboard.css">

    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
    >

    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
    >

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

                <a href="dashboard.php" class="active">
                    <i class="bi bi-grid"></i>
                    <span>Dashboard</span>
                </a>

                <a href="carteira.php">
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
                    <i class="bi bi-bar-chart"></i>
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


    <!-- =========================
         MAIN
    ========================== -->

    <main class="main">


        <!-- =========================
             TOPBAR
        ========================== -->

        <header class="topbar">

            <div>

                <h1>
                    Dashboard
                </h1>

                <p>
                    Quinta-feira, 18 de junho de 2026
                </p>

            </div>

        </header>


        <!-- =========================
             CARD PRINCIPAL
        ========================== -->

        <section class="card-big">

            <div>

                <span class="card-label">
                    SALDO TOTAL DA CARTEIRA
                </span>

                <h2>
                    R$ 48.392,17
                </h2>


                <div class="stats">

                    <div>

                        <p>
                            Total investido
                        </p>

                        <strong>
                            R$ 41.000,00
                        </strong>

                    </div>


                    <div>

                        <p>
                            Saldo livre
                        </p>

                        <strong>
                            R$ 3.200,00
                        </strong>

                    </div>


                    <div>

                        <p>
                            Rendimento
                        </p>

                        <strong class="green">
                            R$ 4.192,17
                        </strong>

                    </div>

                </div>

            </div>


            <div class="badge">
                ▲ +10,2% total
            </div>

        </section>


        <!-- =========================
             CARDS
        ========================== -->

        <section class="grid">


            <!-- RENDA FIXA -->

            <div class="card">

                <div class="card-icon">

                    <i class="bi bi-shield-check"></i>

                </div>

                <h4>
                    Renda fixa
                </h4>

                <p>
                    R$ 18.400
                </p>

                <span class="green">
                    ▲ +0,8% mês
                </span>

            </div>


            <!-- RENDA VARIÁVEL -->

            <div class="card">

                <div class="card-icon">

                    <i class="bi bi-graph-up-arrow"></i>

                </div>

                <h4>
                    Renda variável
                </h4>

                <p>
                    R$ 21.600
                </p>

                <span class="green">
                    ▲ +2,1% mês
                </span>

            </div>


            <!-- CRIPTO -->

            <div class="card">

                <div class="card-icon">

                    <i class="bi bi-currency-bitcoin"></i>

                </div>

                <h4>
                    Cripto
                </h4>

                <p>
                    R$ 5.192
                </p>

                <span class="green">
                    ▲ +4,7% mês
                </span>

            </div>


            <!-- INTERNACIONAL -->

            <div class="card">

                <div class="card-icon">

                    <i class="bi bi-globe2"></i>

                </div>

                <h4>
                    Internacional
                </h4>

                <p>
                    R$ 3.200
                </p>

                <span class="red">
                    ▼ -0,3% mês
                </span>

            </div>


        </section>


        <!-- =========================
             GRÁFICO
        ========================== -->

        <section class="chart">

            <div class="chart-header">

                <div>

                    <h3>
                        Evolução da carteira
                    </h3>

                    <p>
                        Acompanhe o crescimento dos seus investimentos
                    </p>

                </div>


                <button class="chart-filter">

                    Últimos 6 meses

                    <i class="bi bi-chevron-down"></i>

                </button>

            </div>


            <div class="chart-box">

                <div class="chart-placeholder">

                    <i class="bi bi-bar-chart-line"></i>

                    <span>
                        Gráfico da evolução da carteira
                    </span>

                </div>

            </div>

        </section>


    </main>


</div>


<!-- =========================
     JAVASCRIPT
========================= -->

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