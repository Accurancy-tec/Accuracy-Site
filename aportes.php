<?php
session_start();
include('configs/conexao.php');

if (!isset($_SESSION["id"])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Aportes - Accuracy</title>

    <!-- CSS principal -->
    <link rel="stylesheet" href="css/dashboard.css">

    <!-- CSS específico de Aportes -->
    <link rel="stylesheet" href="css/aportes.css">

    <!-- Fonte -->
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">

    <!-- Ícones -->
    <link rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
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

                <a href="aportes.php" class="active">
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

        <div class="user-area">

            <div class="icons">

                <div class="notification-container">

                    <button class="notification-btn"
                        type="button"
                        id="notificationBtn"
                        aria-label="Notificações">

                        <i class="bi bi-bell"></i>
                        <span class="notification-dot" id="notificationDot"></span>

                    </button>

                    <div class="notification-panel" id="notificationPanel">

                        <div class="notification-header">
                            <h3>Notificações</h3>

                            <button type="button" id="markRead">
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
                <h1>Aportes</h1>
                <p id="currentDate">Quinta-feira, 18 de junho de 2026</p>
            </div>

        </header>

        <section class="cards-top">

            <div class="info-card">
                <span>TOTAL APORTADO ESTE MÊS</span>

                <h3 id="totalMonth">R$ 0,00</h3>

                <small class="green">
                    ▲ Aportes realizados
                </small>
            </div>

            <div class="info-card">
                <span>APORTES RECORRENTES ATIVOS</span>

                <h3 id="activeRecurring">0 ativos</h3>

                <small class="blue" id="nextContribution">
                    Nenhum aporte programado
                </small>
            </div>

            <div class="info-card">
                <span>MÉDIA MENSAL</span>

                <h3 id="monthlyAverage">R$ 0,00</h3>

                <small class="green">
                    Média dos aportes
                </small>
            </div>

        </section>

        <section class="content-grid">

            <div class="aporte-form">

                <h3>Novo aporte</h3>

                <label for="asset">Ativo</label>

                <select id="asset">
                    <option value="PETR4">PETR4 — Petrobras</option>
                    <option value="Bitcoin">Bitcoin</option>
                    <option value="CDB Nubank">CDB Nubank</option>
                    <option value="XPML11">XPML11</option>
                    <option value="Outro">Outro</option>
                </select>

                <label for="amount">Valor do aporte</label>

                <input
                    type="text"
                    id="amount"
                    value="R$ 500,00"
                    inputmode="decimal">

                <label>Valores rápidos</label>

                <div class="quick-values">
                    <button type="button" data-value="100">R$ 100</button>
                    <button type="button" data-value="250">R$ 250</button>
                    <button type="button" data-value="500">R$ 500</button>
                    <button type="button" data-value="750">R$ 750</button>
                    <button type="button" data-value="1000">R$ 1.000</button>
                    <button type="button" id="otherValue">Outro</button>
                </div>

                <div class="row">

                    <div>
                        <label for="type">Tipo</label>

                        <select id="type">
                            <option value="Compra">Compra</option>
                            <option value="Aporte">Aporte</option>
                        </select>
                    </div>

                    <div>
                        <label for="date">Data</label>
                        <input type="date" id="date">
                    </div>

                </div>

                <label for="recurrence">Recorrência</label>

                <select id="recurrence">
                    <option value="none">Nenhuma (único)</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                </select>

                <div id="recurrenceDayBox" class="hidden">

                    <label for="recurrenceDay">
                        Dia da recorrência
                    </label>

                    <input
                        type="number"
                        id="recurrenceDay"
                        min="1"
                        max="31"
                        placeholder="Ex: 5">

                </div>

                <label for="observation">
                    Observação (opcional)
                </label>

                <input
                    type="text"
                    id="observation"
                    placeholder="Ex: aporte programado">

                <button
                    class="confirm-btn"
                    id="confirmBtn"
                    type="button">

                    <i class="bi bi-check-circle"></i>
                    Confirmar aporte

                </button>

            </div>

            <div class="aporte-list">

                <div class="list-header">

                    <div>
                        <h3>Meus aportes</h3>

                        <p class="list-subtitle">
                            Histórico dos aportes realizados
                        </p>
                    </div>

                    <span id="contributionCount">
                        0 aportes
                    </span>

                </div>

                <div id="contributionList"></div>

                <div class="empty-state" id="emptyState">

                    <i class="bi bi-wallet2"></i>

                    <strong>
                        Nenhum aporte realizado
                    </strong>

                    <p>
                        Seus aportes aparecerão aqui.
                    </p>

                </div>

            </div>

        </section>

    </main>

</div>

<div class="toast" id="toast">
    <i class="bi bi-check-circle-fill"></i>
    <span id="toastMessage"></span>
</div>

<script src="js/Aportes.js"></script>

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
        document.querySelectorAll(".notification-item.unread")
            .forEach(item => {
                item.classList.remove("unread");

                const dot = item.querySelector(".unread-dot");

                if (dot) {
                    dot.remove();
                }
            });

        notificationDot.style.display = "none";
    });
</script>

</body>
</html>