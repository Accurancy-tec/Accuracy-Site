
<?php
session_start();
include('configs/conexao.php');
if(!isset($_SESSION["nome"])) {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Carteira - Accuracy</title>

    <link rel="stylesheet" href="css/carteira.css">

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
</head>

<body>

<!-- SIDEBAR -->
<div class="sidebar">

    <div class="logo">
        <div class="logo-box"></div>
        <span>Accuracy</span>
    </div>

    <div class="divider"></div>

    <div class="menu">
        <a href="dashboard.php">Dashboard</a>
        <a  class="active">Carteira</a>
        <a href="historico.php">Histórico</a>
        <a href="aportes.php">Aportes</a>
        <a href="#">Relatórios</a>
        <a href="perfil.php">Perfil</a>
    </div>

    <div class="user-box">
        <a href="perfil.php"><div class="avatar">N</div></a>
        <div>
            <a href="perfil.php"><p class="name"><strong><?php echo htmlspecialchars($_SESSION["nome"]); ?></strong></a>
            <small>Perfil do usuário</small>
        </div>
    </div>

</div>

<!-- MAIN -->
<div class="main">

    <!-- 🔥 TOPBAR (CORRIGIDO) -->
    <div class="topbar">

        <div>
            <h1>Carteira</h1>
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

    </div>

    <!-- CARDS -->
    <div class="cards">

        <div class="card highlight">
            <h3>PATRIMÔNIO TOTAL</h3>
            <p>R$ 48.392,17</p>
            <span>+10,2% desde o início</span>
        </div>

        <div class="card">
            <h3>TOTAL INVESTIDO</h3>
            <p>R$ 41.200,00</p>
            <span>+3,1% no mês</span>
        </div>

        <div class="card">
            <h3>RENDIMENTO TOTAL</h3>
            <p class="green">R$ 4.192,17</p>
            <span>+8,4% na efetivo</span>
        </div>

    </div>

    <!-- CONTENT -->
    <div class="content">

        <!-- TABELA -->
        <div class="table-container">

            <div class="table-header">
                <h3>Investimentos ativos</h3>
                <span class="badge">1 ativo</span>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ATIVO</th>
                        <th>QUANTIDADE</th>
                        <th>PREÇO ATUAL</th>
                        <th>VALOR TOTAL</th>
                        <th>RENDIMENTO</th>
                    </tr>
                </thead>

                <tbody>
                    <tr>
                        <td>Bitcoin</td>
                        <td>0,0083</td>
                        <td>R$ 598.420</td>
                        <td>R$ 4.966,89</td>
                        <td class="green">+18,4%</td>
                    </tr>
                </tbody>
            </table>

        </div>

        <!-- GRÁFICO -->
        <div class="chart">

            <h3>Distribuição</h3>

            <div class="circle"></div>

            <div class="legend">
                <div><span>Ações</span> <span>36%</span></div>
                <div><span>Cripto</span> <span>26%</span></div>
                <div><span>Renda Fixa</span> <span>21%</span></div>
                <div><span>FIIs</span> <span>11%</span></div>
                <div><span>Internacional</span> <span>6%</span></div>
            </div>

        </div>

    </div>

</div>

</body>
</html>