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

<title>Histórico - Accuracy</title>

<link rel="stylesheet" href="css/historico.css">
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
                <a href="dashboard.php">Dashboard</a>
                <a href="carteira.php">Carteira</a>
                <a class="active">Histórico</a>
                <a href="aportes.php" >Aportes</a>
                <a>Relatórios</a>
                <a href="perfil.php">Perfil</a>
            </nav>

        </div>

        <div class="user">
            <a href="perfil.php">
                <div class="avatar">N</div>
            </a>

            <div>
                <a href="perfil.php"><strong><?php echo htmlspecialchars($_SESSION["nome"]); ?></strong></a>
                <p>Perfil do usuário</p>
            </div>
        </div>

    </aside>

    <!-- MAIN (NÃO ALTERADO) -->
    <main class="main">

        <header class="topbar">
            <div>
                <h1>Histórico</h1>
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

        <section class="cards">
            <div class="card">
                <span>Total aportado</span>
                <h3>R$ 41.200</h3>
                <p>28 operações</p>
            </div>

            <div class="card green">
                <span>Ganho realizado</span>
                <h3>R$ 3.840</h3>
                <p>+3,8%</p>
            </div>

            <div class="card red">
                <span>Perda realizada</span>
                <h3>R$ 420</h3>
                <p>-1,0%</p>
            </div>

            <div class="card">
                <span>Resultado líquido</span>
                <h3>R$ 3.420</h3>
                <p class="green">+2,8% total</p>
            </div>
        </section>

        <section class="chart">
            <h3>Rendimento mensal</h3>
            <div class="chart-box">Gráfico</div>
        </section>

        <section class="table">

            <div class="table-header">
                <h3>Transações</h3>

                <div class="filters">
                    <button class="active">Todos</button>
                    <button>Compra</button>
                    <button>Venda</button>
                    <button>Dividendo</button>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Ativo</th>
                        <th>Tipo</th>
                        <th>Data</th>
                        <th>Valor</th>
                        <th>Retorno</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>

                    <tr>
                        <td>PETR4</td>
                        <td class="green">Compra</td>
                        <td>12/06/2026</td>
                        <td>R$ 7.480</td>
                        <td class="green">+4,1%</td>
                        <td><span class="status done">Concluída</span></td>
                    </tr>

                    <tr>
                        <td>Bitcoin</td>
                        <td class="green">Compra</td>
                        <td>05/06/2026</td>
                        <td>R$ 4.814</td>
                        <td class="green">+18,4%</td>
                        <td><span class="status done">Concluída</span></td>
                    </tr>

                    <tr>
                        <td>XPML11</td>
                        <td>Dividendo</td>
                        <td>01/06/2026</td>
                        <td>R$ 89,60</td>
                        <td class="green">+0,9%</td>
                        <td><span class="status done">Concluída</span></td>
                    </tr>

                    <tr>
                        <td>VALE3</td>
                        <td class="green">Compra</td>
                        <td>22/05/2026</td>
                        <td>R$ 9.855</td>
                        <td class="red">-2,3%</td>
                        <td><span class="status done">Concluída</span></td>
                    </tr>

                    <tr>
                        <td>Ethereum</td>
                        <td class="green">Compra</td>
                        <td>10/05/2026</td>
                        <td>R$ 7.190</td>
                        <td class="green">+9,2%</td>
                        <td><span class="status done">Concluída</span></td>
                    </tr>

                    <tr>
                        <td>CDB Nubank</td>
                        <td class="green">Compra</td>
                        <td>01/05/2026</td>
                        <td>R$ 5.000</td>
                        <td class="green">+12,5%</td>
                        <td><span class="status pending">Pendente</span></td>
                    </tr>

                </tbody>
            </table>

        </section>

    </main>

</div>

</body>
</html>