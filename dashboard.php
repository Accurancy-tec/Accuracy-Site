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

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

</head>

<body>

<div class="app">

    <!-- SIDEBAR -->
    <aside class="sidebar">

        <div class="top">

            <div class="logo">
                <div class="logo-box"></div>
                <span>Accuracy</span>
            </div>

            <div class="divider"></div>

            <nav class="menu">

                <a class="active">Dashboard</a>
                <a href="carteira.php">Carteira</a>
                <a href="historico.php">Histórico</a>
                <a href="aportes.php">Aportes</a>
                <a>Relatórios</a>
                <a href="perfil.php">Perfil</a>

            </nav>

        </div>

        <div class="user">

            <a href="perfil.php">
                <div class="avatar">N</div>
            </a>

            <div>
                <a href="perfil.php"><strong><?php echo($_SESSION["nome"]); ?></strong></a>
                <p>Perfil do usuario</p>
            </div>

        </div>

    </aside>

    <!-- MAIN -->
    <main class="main">

        <header class="topbar">

            <div>
                <h1>Dashboard</h1>
                <p>Quinta-feira, 18 de junho de 2026</p>
            </div>

            <div class="icons">

                <button class="notification-btn">
                    <i class="bi bi-bell"></i>
                    <span class="notification-dot"></span>
                </button>

                <a href="perfil.php">
                    <div class="avatar small">N</div>
                </a>

            </div>

        </header>

        <!-- CARD PRINCIPAL -->
        <section class="card-big">

            <div>

                <span>SALDO TOTAL DA CARTEIRA</span>

                <h2>R$ 48.392,17</h2>

                <div class="stats">

                    <div>
                        <p>Total investido</p>
                        <strong>R$ 41.000,00</strong>
                    </div>

                    <div>
                        <p>Saldo livre</p>
                        <strong>R$ 3.200,00</strong>
                    </div>

                    <div>
                        <p>Rendimento</p>
                        <strong class="green">R$ 4.192,17</strong>
                    </div>

                </div>

            </div>

            <div class="badge">▲ +10,2% total</div>

        </section>

        <!-- CARDS -->
        <section class="grid">

            <div class="card">
                <h4>Renda fixa</h4>
                <p>R$ 18.400</p>
                <span class="green">▲ +0,8% mês</span>
            </div>

            <div class="card">
                <h4>Renda variável</h4>
                <p>R$ 21.600</p>
                <span class="green">▲ +2,1% mês</span>
            </div>

            <div class="card">
                <h4>Cripto</h4>
                <p>R$ 5.192</p>
                <span class="green">▲ +4,7% mês</span>
            </div>

            <div class="card">
                <h4>Internacional</h4>
                <p>R$ 3.200</p>
                <span class="red">▼ -0,3% mês</span>
            </div>

        </section>

        <!-- CHART -->
        <section class="chart">

            <h3>Evolução da carteira</h3>

            <div class="chart-box">
                Gráfico
            </div>

        </section>

    </main>

</div>

</body>
</html>